import { sentenceCase } from 'change-case'
import Mongoose, {
    Connection,
    ConnectionOptions,
    Model,
    Mongoose as MongooseType
} from 'mongoose'
import {
    DatabaseRepositoryInterface,
    ResourceHelpers,
    Config,
    resource,
    text,
    hasMany,
    ResourceContract,
    DataPayload,
    FetchAllRequestQuery
} from '@tensei/common'
import { array } from '@tensei/common'
import { belongsTo } from '@tensei/common'
import { dateTime } from '@tensei/common'

export class Repository extends ResourceHelpers
    implements DatabaseRepositoryInterface<any> {
    private $db: Mongoose.Connection | null = null

    private connectionString: string = ''

    private config: ConnectionOptions = {}

    private mongooseModels: Model<any>[] = []

    public async setup(config: Config) {
        this.config = config.databaseConfig[1]
        this.connectionString = config.databaseConfig[0]

        config.pushResource(this.administratorResource())
        config.pushResource(this.roleResource())
        config.pushResource(this.passwordResetsResource())

        Mongoose.set('debug', true)

        this.resources = config.resources

        try {
            this.bootMongooseModels()

            await this.establishDatabaseConnection()

            await this.setupRolesAndPermissions()
        } catch (errors) {
            // TODO: Log these errors with this.logger
            console.error('*************', errors)
            process.exit(1)
        }

        return this.$db
    }

    public setResourceModels = (resources: ResourceContract[]) =>
        resources.map((resource, index) => {
            resource.Model = () => this.mongooseModels[index]

            return resource
        })

    private getResourceMongooseModel = (
        resource: ResourceContract = this.getCurrentResource()
    ) =>
        this.mongooseModels.find(
            // @ts-ignore
            Model => resource.data.name === Model.getTenseiResourceName()
        )

    private bootMongooseModels() {
        Mongoose.set('useCreateIndex', true)

        this.mongooseModels = this.resources.map(resource => {
            const schemaDefinition: Mongoose.SchemaDefinition = {}

            resource.data.fields.forEach(field => {
                const serializedField = field.serialize()

                let defaultValue: any = ''
                let type: any = Mongoose.Schema.Types.String

                if (field.databaseFieldType === 'increments') {
                    return
                }

                if (
                    ['string', 'text', 'enu', 'json'].includes(field.databaseFieldType)
                ) {
                    type = Mongoose.Schema.Types.String
                }

                if (
                    ['datetime', 'date', 'timestamp'].includes(
                        field.databaseFieldType
                    )
                ) {
                    type = Mongoose.Schema.Types.Date

                    if (field.serialize().defaultToNow) {
                        defaultValue = new Date()
                    }
                }

                if (['boolean'].includes(field.databaseFieldType)) {
                    type = Mongoose.Schema.Types.Boolean
                }

                if (
                    ['integer', 'bigInteger'].includes(field.databaseFieldType)
                ) {
                    type = Mongoose.Schema.Types.Number
                }

                if (['array'].includes(field.databaseFieldType)) {
                    type = [String]

                    defaultValue = []
                }

                if (field.component === 'BelongsToField') {
                    type = Mongoose.Schema.Types.ObjectId

                    defaultValue = null
                }

                if (['HasManyField', 'BelongsToManyField'].includes(field.component)) {
                    type = [Mongoose.Schema.Types.ObjectId]

                    defaultValue = []
                }

                schemaDefinition[field.databaseField] = {
                    type,
                    unique: field.isUnique,
                    index: field.isUnique || field.isSearchable,
                    default: serializedField.defaultValue || defaultValue
                }

                if (
                    ['BelongsToField', 'HasManyField', 'BelongsToManyField'].includes(field.component)
                ) {
                    schemaDefinition[field.databaseField] = {
                        ...schemaDefinition[field.databaseField],
                        ref: field.name
                    }
                }

                if (['enu'].includes(field.databaseFieldType)) {
                    schemaDefinition[field.databaseField] = {
                        ...schemaDefinition[field.databaseField],
                        enum: (serializedField.selectOptions || []).map(
                            option => option.value
                        )
                    }
                }
            })

            const schema = new Mongoose.Schema(schemaDefinition)

            schema.statics.getTenseiResourceName = () => resource.data.name

            return Mongoose.model(resource.data.name, schema)
        })
    }

    private roleResource() {
        return resource('Administrator Role')
            .hideFromNavigation()
            .fields([
                text('Name')
                    .rules('required')
                    .unique(),
                text('Slug')
                    .rules('required')
                    .unique(),
                array('Permissions').of('string')
            ])
    }

    private passwordResetsResource() {
        return resource('Administrator Password Reset')
            .hideFromNavigation()
            .fields([
                text('Email')
                    .searchable()
                    .unique()
                    .notNullable(),
                text('Token')
                    .unique()
                    .notNullable(),
                dateTime('Expires At')
            ])
    }

    private getDefaultQuery = (baseQuery: FetchAllRequestQuery) => {
        return {
            ...baseQuery,
            page: baseQuery.page || 1,
            search: baseQuery.search || '',
            fields: baseQuery.fields || ['*'],
            perPage: baseQuery.perPage || baseQuery.per_page || 10
        }
    }

    private administratorResource() {
        const Bcrypt = require('bcryptjs')

        return resource('Administrator')
            .hideFromNavigation()
            .fields([
                text('Name'),
                text('Email')
                    .unique()
                    .searchable()
                    .rules('required', 'email'),
                text('Password')
                    .hidden()
                    .rules('required', 'min:8'),
                belongsTo('Administrator Role')
            ])
            .beforeCreate(payload => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password)
            }))
            .beforeUpdate(payload => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password)
            }))
    }

    private setupRolesAndPermissions = async () => {
        const permissions: string[] = []

        this.resources.forEach(resource => {
            ;['create', 'read', 'update', 'delete'].forEach(operation => {
                permissions.push(`${operation}:${resource.data.slug}`)
            })

            resource.data.actions.forEach(action => {
                permissions.push(
                    `run:${resource.data.slug}:${action.data.slug}`
                )
            })
        })

        const roleResource = this.findResource('Administrator Role')

        if (!roleResource) {
            throw {
                message: 'Role and Permission resources must be defined.',
                status: 500
            }
        }

        const RoleModel = this.getResourceMongooseModel(roleResource)

        if (!RoleModel) {
            throw {
                message: 'Role and Permission models must be defined.',
                status: 500
            }
        }

        let superAdminRole = await RoleModel.findOne({
            slug: 'super-admin'
        })

        if (!superAdminRole) {
            superAdminRole = await RoleModel.create({
                name: 'Super Admin',
                slug: 'super-admin',
                permissions
            })
        } else {
            await RoleModel.updateOne(
                {
                    _id: superAdminRole._id
                },
                {
                    permissions
                }
            )
        }
    }

    async establishDatabaseConnection() {
        await Mongoose.connect(this.connectionString, this.config)

        this.$db = Mongoose.connection
    }

    async aggregateCount(between: [string, string]) {
        return 0
    }

    async aggregateAvg(between: [string, string], columns: string[]) {
        return 0
    }

    async aggregateMin(between: [string, string], columns: string[]) {
        return 0
    }

    async aggregateMax(between: [string, string], columns: string[]) {
        return 0
    }

    async create(payload: DataPayload, relationshipPayload: DataPayload = {}) {
        const Model = this.getResourceMongooseModel()!

        const result = await Model.create({
            ...payload,
            ...relationshipPayload
        })

        return this.resetIdField(
            result.toJSON()
        )
    }

    async update(
        id: number | string,
        payload: DataPayload,
        relationshipPayload: DataPayload,
    ) {
        const result = await Model.findByIdAndUpdate(id, {
            ...payload,
            ...relationshipPayload
        })

        return this.resetIdField(
            result.toJSON()
        )
    }

    findAll(query: FetchAllRequestQuery) {
        return Promise.resolve({} as any)
    }

    async findAllData(query: FetchAllRequestQuery) {
        const [, dataResolver] = this.findAllResolvers(query)

        return dataResolver()
    }

    findAllResolvers(baseQuery: FetchAllRequestQuery) {
        const Model = this.getResourceMongooseModel()!

        const query = this.getDefaultQuery(baseQuery)

        const getQuery = () => Model.find(
            this.handleFilterQueries(query)
        )

        return [
            () => getQuery().count(),
            () => getQuery().limit(query.perPage).skip((query.page - 1) * query.perPage)
        ]
    }

    findAllByIds(ids: number[], fields?: string[]) {
        return Promise.resolve([])
    }

    async findAllBelongingToManyData(
        relatedResourceContract: ResourceContract,
        ResourceContractId: number | string,
        query: FetchAllRequestQuery
    ) {}

    async findAllBelongingToManyCount(
        relatedResourceContract: ResourceContract,
        ResourceContractId: number | string,
        query: FetchAllRequestQuery
    ) {
        return 0
    }

    findAllBelongingToManyResolvers(
        relatedResourceContract: ResourceContract,
        ResourceContractId: number | string,
        query: FetchAllRequestQuery
    ) {
        return []
    }

    public handleFilterQueries(query: FetchAllRequestQuery) {
        let findQuery: DataPayload = {}
        
        query.filters?.forEach(filter => {
            if(filter.operator === 'in') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $in: Array.isArray(filter.value) ? filter.value : [filter.value]
                }
            }

            if(filter.operator === 'not_in') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $nin: Array.isArray(filter.value) ? filter.value : [filter.value]
                }
            }

            if (filter.operator === 'matches') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $regex: new RegExp(filter.value)
                }
            }

            if (filter.operator === 'equals') {
                findQuery[filter.field] = filter.value
            }

            if (filter.operator === 'contains') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $regex: new RegExp(`.*${filter.value}.*`)
                }
            }

            if (filter.operator === 'gte') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $gte: filter.value
                }
            }

            if (filter.operator === 'gt') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $gt: filter.value
                }
            }

            if (filter.operator === 'lte') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $lte: filter.value
                }
            }

            if (filter.operator === 'lt') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $lt: filter.value
                }
            }

            if (filter.operator === 'is_null') {
                findQuery[filter.field] = null
            }

            if (filter.operator === 'not_null') {
                findQuery[filter.field] = {
                    ...findQuery[filter.field],
                    $ne: null
                }
            }
        })

        return findQuery
    }

    findAllBelongingToMany(
        relatedResourceContract: ResourceContract,
        ResourceContractId: number | string,
        query: FetchAllRequestQuery
    ) {
        return Promise.resolve({} as any)
    }

    async findOneById(
        id: number | string,
        fields?: string[],
        withRelationships?: string[]
    ) {
        const Model = this.getResourceMongooseModel()!

        const model = await Model.findOne({
            _id: id
        })

        if (! model) {
            return model
        }

        return this.resetIdField(model)
    }

    async findOneByField(field: string, value: string, fields?: string[]) {
        const Model = this.getResourceMongooseModel()!

        const model = await Model.findOne({
            [field]: value
        })

        if (! model) {
            return model
        }

        return this.resetIdField(model)
    }

    findOneByFieldExcludingOne(
        field: string,
        value: string,
        excludeId: string | number,
        fields?: string[]
    ) {
        return Promise.resolve(null)
    }

    updateManyByIds(ids: number[], valuesToUpdate: {}) {
        return Promise.resolve(1)
    }

    updateOneByField(field: string, value: any, payload: DataPayload = {}) {
        return Promise.resolve(null)
    }

    deleteById(id: number | string) {
        return Promise.resolve()
    }

    updateManyWhere(
        whereClause: {
            [key: string]: string | number
        },
        valuesToUpdate: {}
    ) {
        return Promise.resolve()
    }

    async findAllCount(query?: FetchAllRequestQuery) {
        const [countResolver] = this.findAllResolvers(query || {})

        return countResolver() as any
    }

    private resetIdField(response: any) {
        if (Array.isArray(response)) {
            return response.map(r => ({
                ...r,
                id: r._id
            }))
        }

        return {
            ...response,
            id: response._id
        }
    }
}
