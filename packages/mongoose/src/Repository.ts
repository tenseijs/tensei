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

export class Repository
    extends ResourceHelpers
    implements DatabaseRepositoryInterface<any> {
    private $db: MongooseType | null = null

    private connectionString: string = ''

    private config: ConnectionOptions = {}

    private mongooseModels: Model<any>[] = []

    public async setup(config: Config) {
        this.config = config.databaseConfig[1]
        this.connectionString = config.databaseConfig[0]

        config.pushResource(this.administratorResource())
        config.pushResource(this.roleResource())
        config.pushResource(this.passwordResetsResource())

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

                let type: any = null

                if (field.databaseFieldType === 'increments') {
                    return
                }

                if (
                    ['string', 'text', 'enu'].includes(field.databaseFieldType)
                ) {
                    type = Mongoose.Schema.Types.String
                }

                if (
                    ['datetime', 'date', 'timestamp'].includes(
                        field.databaseFieldType
                    )
                ) {
                    type = Mongoose.Schema.Types.Date
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
                }

                if (field.component === 'BelongsToField') {
                    type = Mongoose.Schema.Types.ObjectId
                }

                if (field.component === 'HasManyField') {
                    type = [Mongoose.Schema.Types.ObjectId]
                }

                schemaDefinition[field.databaseField] = {
                    type,
                    unique: field.isUnique,
                    index: field.isUnique || field.isSearchable,
                    default: serializedField.defaultToNow
                        ? Date.now
                        : serializedField.defaultValue
                }

                if (
                    ['BelongsToField', 'HasManyField'].includes(field.component)
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
                text('Name').rules('required').unique(),
                text('Slug').rules('required').unique(),
                array('Permissions').of('string')
            ])
    }

    private passwordResetsResource() {
        return resource('Administrator Password Reset')
            .hideFromNavigation()
            .fields([
                text('Email').searchable().unique().notNullable(),
                text('Token').unique().notNullable(),
                dateTime('Expires At')
            ])
    }

    private administratorResource() {
        const Bcrypt = require('bcryptjs')

        return resource('Administrator')
            .hideFromNavigation()
            .fields([
                text('Name'),
                text('Email').unique().searchable().rules('required', 'email'),
                text('Password').hidden().rules('required', 'min:8'),
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
        this.$db = await Mongoose.connect(this.connectionString, this.config)
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

    async create(payload: DataPayload, relationshipPayload?: DataPayload) {
        const resource = this.getCurrentResource()
        const Model = this.getResourceMongooseModel()!

        const result = await Model.create(payload)

        const relationshipFields = resource
            .serialize()
            .fields.filter(field => field.isRelationshipField)
    }

    update(
        id: number | string,
        payload: DataPayload,
        relationshipPayload: DataPayload,
        patch: boolean
    ) {
        return Promise.resolve()
    }

    findAll(query: FetchAllRequestQuery) {
        return Promise.resolve({} as any)
    }

    findAllData(query: FetchAllRequestQuery) {
        return Promise.resolve({} as any)
    }

    findAllResolvers(query: FetchAllRequestQuery) {
        return []
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

    public handleFilterQueries() {}

    findAllBelongingToMany(
        relatedResourceContract: ResourceContract,
        ResourceContractId: number | string,
        query: FetchAllRequestQuery
    ) {
        return Promise.resolve({} as any)
    }

    findOneById(
        id: number | string,
        fields?: string[],
        withRelationships?: string[]
    ) {
        return Promise.resolve(null)
    }

    findOneByField(field: string, value: string, fields?: string[]) {
        return Promise.resolve(null)
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

    findAllCount() {
        return Promise.resolve(null as any)
    }
}
