import { sentenceCase } from 'change-case'
import Mongoose, { Connection, ConnectionOptions, Model, Mongoose as MongooseType } from 'mongoose'
import { DatabaseRepositoryInterface, ResourceHelpers, Config, ResourceContract, DataPayload, FetchAllRequestQuery } from '@tensei/common'

export class Repository extends ResourceHelpers implements DatabaseRepositoryInterface {
    private $db: MongooseType | null = null

    private connectionString: string = ''

    private config: ConnectionOptions = {}

    private mongooseModels: Model<any>[] = []

    public async setup(config: Config) {
        this.config = config.databaseConfig[1]
        this.connectionString = config.databaseConfig[0]

        this.resources = config.resources

        try {
            this.bootMongooseModels()

            await this.establishDatabaseConnection()
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
    ) => this.mongooseModels.find(Model => resource.data.name === Model.name)

    private bootMongooseModels() {
         this.mongooseModels = this.resources.map(resource => {
            const schemaDefinition: Mongoose.SchemaDefinition = {}

            resource.data.fields.forEach(field => {
                const serializedField = field.serialize()

                let type: any = null

                if (['string', 'text'].includes(field.databaseFieldType)) {
                    type = Mongoose.Schema.Types.String
                }

                if (['datetime', 'date', 'timestamp'].includes(field.databaseFieldType)) {
                    type = Mongoose.Schema.Types.Date
                }

                if (['boolean'].includes(field.databaseFieldType)) {
                    type = Mongoose.Schema.Types.Boolean
                }

                if (['integer', 'bigInteger'].includes(field.databaseFieldType)) {
                    type = Mongoose.Schema.Types.Number
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
                    index: field.isSearchable,
                    default: serializedField.defaultToNow ? Date.now : serializedField.defaultValue,
                }

                if (['BelongsToField', 'HasManyField'].includes(field.component)) {
                    schemaDefinition[field.databaseField] = {
                        ...schemaDefinition[field.databaseField],
                        ref: field.name
                    }
                }
            })

            const schema = new Mongoose.Schema(schemaDefinition)

            schema.statics.getTenseiResourceName = () => resource.data.name

            return Mongoose.model(resource.data.name, schema)
        })
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
        const permissionResource = this.findResource('Administrator Permission')

        if (!roleResource || !permissionResource) {
            throw {
                message: 'Role and Permission resources must be defined.',
                status: 500
            }
        }

        const RoleModel = this.getResourceMongooseModel(roleResource)
        const PermissionModel = this.getResourceMongooseModel(
            permissionResource
        )

        // find all existing permissions
        // const existingPermissions = (
        //     await PermissionModel.query().whereIn('slug', permissions)
        // ).map((permission: any) => permission.slug)

        // const newPermissionsToCreate = permissions.filter(
        //     permission => !existingPermissions.includes(permission)
        // )

        // const insertValues = newPermissionsToCreate.map(permission => ({
        //     name: sentenceCase(permission.split(':').join(' ')),
        //     slug: permission
        // }))

        // if (insertValues.length > 0) {
        //     await PermissionModel.query().insert(
        //         newPermissionsToCreate.map(permission => ({
        //             name: sentenceCase(permission.split(':').join(' ')),
        //             slug: permission
        //         }))
        //     )
        // }

        // let superAdminRole = (
        //     await RoleModel.query()
        //         .where('slug', 'super-admin')
        //         .limit(1)
        // )[0]

        // if (!superAdminRole) {
        //     await RoleModel.query().insert({
        //         name: 'Super Admin',
        //         slug: 'super-admin'
        //     })

        //     superAdminRole = (
        //         await RoleModel.query()
        //             .where('slug', 'super-admin')
        //             .limit(1)
        //     )[0]
        // }

        // const allPermissions = await PermissionModel.query()

        // await new RoleModel({
        //     id: superAdminRole.id
        // })
        //     [permissionResource.data.slug]()
        //     .detach()

        // await new RoleModel({
        //     id: superAdminRole.id
        // })
        //     [permissionResource.data.slug]()
        //     .attach(allPermissions.map((permission: any) => permission.id))
    }

    async establishDatabaseConnection() {
         this.$db = await Mongoose.connect(
            this.connectionString,
            this.config
        )
    }

    create(payload: DataPayload, relationshipPayload?: DataPayload) {
        return Promise.resolve()
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

    findAllByIds(ids: number[], fields?: string[]) {
        return Promise.resolve([])
    }

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

    findOneByField(
        field: string,
        value: string,
        fields?: string[]
    ) {
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

    updateManyByIds(
        ids: number[],
        valuesToUpdate: {}
    ) {
        return Promise.resolve(1)
    }

    updateOneByField(
        field: string,
            value: any,
            payload: DataPayload = {}
    ) {
        return Promise.resolve(null)
    }

    deleteById(id: number | string) {
        return Promise.resolve()
    }

    updateManyWhere(whereClause: {
        [key: string]: string | number
    },
    valuesToUpdate: {}) {
        return Promise.resolve()
    }

    findAllCount() {
        return Promise.resolve(null as any)
    }
}
