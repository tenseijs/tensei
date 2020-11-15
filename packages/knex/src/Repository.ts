import Knex, {
    CreateTableBuilder,
    ColumnBuilder,
    AlterTableBuilder
} from 'knex'
import Pluralize from 'pluralize'
import Bookshelf from 'bookshelf'
import { snakeCase, sentenceCase } from 'change-case'

import {
    text,
    Config,
    resource,
    dateTime,
    DataPayload,
    belongsToMany,
    SerializedField,
    ResourceHelpers,
    ResourceContract,
    SerializedResource,
    FetchAllRequestQuery,
    DatabaseRepositoryInterface
} from '@tensei/common'

export class SqlRepository extends ResourceHelpers
    implements DatabaseRepositoryInterface<any> {
    private $db: Knex | null = null

    private migrationsTable: string = 'migrations'

    private config: Knex.Config = {}

    private bookshelfModels: any[] = []

    private connectionEstablished: boolean = false

    public static databases = ['mysql', 'pg']

    public establishDatabaseConnection = () => {
        if (!this.connectionEstablished) {
            this.$db = Knex(this.config)
        }

        this.connectionEstablished = true
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

                belongsToMany('Administrator'),
                belongsToMany('Administrator Permission')
            ])
            .hideFromApi()
    }

    private permissionResource() {
        return resource('Administrator Permission')
            .hideFromNavigation()
            .fields([
                text('Name'),
                text('Slug')
                    .rules('required')
                    .unique(),
                belongsToMany('Administrator Role')
            ])
            .hideFromApi()
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
            .hideFromApi()
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
                belongsToMany('Administrator Role')
            ])
            .beforeCreate(payload => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password)
            }))
            .beforeUpdate(payload => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password)
            }))
            .hideFromApi()
    }

    public setup = async (config: Config) => {
        this.config = config.databaseConfig[0]

        this.establishDatabaseConnection()

        config.pushResource(this.administratorResource())

        config.pushResource(this.roleResource())
        config.pushResource(this.permissionResource())
        config.pushResource(this.passwordResetsResource())

        this.resources = config.resources

        try {
            await this.performDatabaseSchemaSync(
                this.resources.map(resource => resource.serialize())
            )

            await this.bootBookshelfModels()

            await this.setupRolesAndPermissions(config)
        } catch (errors) {
            // TODO: Log these errors with this.logger
            console.log('(********************', errors)
            // process.exit(1)
        }

        return this.$db
    }

    public setResourceModels = (resources: ResourceContract[]) =>
        resources.map((resource, index) => {
            resource.Model = () => this.bookshelfModels[index]

            return resource
        })

    private getResourceBookshelfModel = (
        resource: ResourceContract = this.getCurrentResource()
    ) => {
        return this.bookshelfModels.find(
            model => model.resourceName === resource.data.name
        )
    }

    private setupRolesAndPermissions = async (config: Config) => {
        const permissions: string[] = []

        this.resources.forEach(resource => {
            ;['insert', 'fetch', 'show', 'update', 'delete'].forEach(
                operation => {
                    permissions.push(`${operation}:${resource.data.slug}`)
                }
            )

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

        const RoleModel = this.getResourceBookshelfModel(roleResource)
        const PermissionModel = this.getResourceBookshelfModel(
            permissionResource
        )

        // find all existing permissions
        const existingPermissions = (
            await PermissionModel.query().whereIn('slug', permissions)
        ).map((permission: any) => permission.slug)

        const newPermissionsToCreate = permissions.filter(
            permission => !existingPermissions.includes(permission)
        )

        const insertValues = newPermissionsToCreate.map(permission => ({
            name: sentenceCase(permission.split(':').join(' ')),
            slug: permission
        }))

        if (insertValues.length > 0) {
            await PermissionModel.query().insert(
                newPermissionsToCreate.map(permission => ({
                    name: sentenceCase(permission.split(':').join(' ')),
                    slug: permission
                }))
            )
        }

        let superAdminRole = (
            await RoleModel.query()
                .where('slug', 'super-admin')
                .limit(1)
        )[0]

        if (!superAdminRole) {
            await RoleModel.query().insert({
                name: 'Super Admin',
                slug: 'super-admin'
            })

            superAdminRole = (
                await RoleModel.query()
                    .where('slug', 'super-admin')
                    .limit(1)
            )[0]
        }

        const allPermissions = await PermissionModel.query()

        await new RoleModel({
            id: superAdminRole.id
        })
            [permissionResource.data.slug]()
            .detach()

        await new RoleModel({
            id: superAdminRole.id
        })
            [permissionResource.data.slug]()
            .attach(allPermissions.map((permission: any) => permission.id))
    }

    private bootBookshelfModels = async () => {
        const bookshelfInstance = Bookshelf(this.$db!)

        const bookshelfModels = this.resources.map(resource => {
            const hiddenFields = resource
                .serialize()
                .fields.filter(field => field.hidden)
                .map(field => field.databaseField)

            const model: any = {
                hidden: hiddenFields,
                tableName: resource.data.table,
                hasTimestamps: !resource.data.noTimeStamps
            }

            resource.data.fields.forEach(field => {
                const relatedResource = this.resources.find(
                    relatedResource => field.name === relatedResource.data.name
                )
                if (!relatedResource) {
                    return
                }

                if (field.component === 'BelongsToField') {
                    model[
                        relatedResource.data.name.toLowerCase()
                    ] = function() {
                        return this.belongsTo(relatedResource.data.name)
                    }
                }

                if (field.component === 'HasManyField') {
                    model[relatedResource.data.slug] = function() {
                        return this.hasMany(relatedResource.data.name)
                    }
                }

                if (field.component === 'BelongsToManyField') {
                    model[relatedResource.data.slug] = function() {
                        return this.belongsToMany(relatedResource.data.name)
                    }
                }
            })

            const modelInstance = bookshelfInstance.model(
                resource.data.name,
                model
            )

            modelInstance.resourceName = resource.data.name

            return modelInstance
        })

        this.bookshelfModels = bookshelfModels
    }

    public async aggregateCount(between: [string, string]) {
        return this.aggregate(between, 'count')
    }

    public async aggregate(
        between: [string, string],
        fn: string,
        fnArgs: any[] = []
    ) {
        const createdAtField = 'created_at'

        const query = this.$db!(
            this.getCurrentResource().data.table
        ).whereBetween(createdAtField, between)

        // @ts-ignore
        const result = await query[fn as any](...fnArgs)

        const aggregate = result[0][`${fn}(*)`] || result[0][`${fn}`]

        return aggregate
    }

    public async aggregateAvg(between: [string, string], columns: string[]) {
        return this.aggregate(between, 'avg', [columns])
    }

    public async aggregateMin(between: [string, string], columns: string[]) {
        return this.aggregate(between, 'min', [columns])
    }

    public async aggregateMax(between: [string, string], columns: string[]) {
        return this.aggregate(between, 'max', [columns])
    }

    public async getAdministratorById(id: string | number) {
        this.setResource(this.administratorResource())

        const admin = await this.findOneById(
            id,
            [],
            [
                `${this.roleResource().data.slug}.${
                    this.permissionResource().data.slug
                }`
            ]
        )

        if (!admin) {
            throw {
                message: `Could not find administrator with id ${id}`,
                status: 404
            }
        }

        admin.permissions = admin['administrator-roles'].reduce(
            (acc: [], role: any) => [
                ...acc,
                ...(role['administrator-permissions'] || []).map(
                    (permission: any) => permission.slug
                )
            ],
            []
        )

        return admin
    }

    public async createAdministrator(payload: DataPayload) {
        this.setResource(this.roleResource())

        const superAdmin = await this.findOneByField('slug', 'super-admin')

        if (!superAdmin) {
            throw {
                message: `The super-admin role must be setup before creating an administrator user.`,
                status: 422
            }
        }

        this.setResource(this.administratorResource())

        const administrator = await this.create(payload, {
            administrator_roles: [superAdmin.id]
        })

        return administrator
    }

    private handleBelongsToManyField = async (
        trx: Knex.Transaction,
        resources: SerializedResource[],
        resource: SerializedResource,
        oldResource: SerializedResource | undefined
    ) => {
        const belongsToManyFields = resource.fields.filter(
            field => field.component === 'BelongsToManyField'
        )

        for (let index = 0; index < belongsToManyFields.length; index++) {
            const field = belongsToManyFields[index]

            if (field.component === 'BelongsToManyField') {
                const relatedResource = resources.find(
                    relatedResource => field.name === relatedResource.name
                )

                const indexOfResource = resources.findIndex(
                    indexResource => resource.name === indexResource.name
                )

                const indexOfRelatedResource = resources.findIndex(
                    relatedResource => field.name === relatedResource.name
                )

                const migrationHasAlreadyBeenRunForRelatedField =
                    indexOfResource < indexOfRelatedResource

                if (migrationHasAlreadyBeenRunForRelatedField) {
                    return
                }

                if (!relatedResource) {
                    console.warn(
                        `The BelongsToMany relationship is pointing to a resource called ${field.name} which does not exist.`
                    )

                    return
                }

                const tableName = [
                    Pluralize(snakeCase(relatedResource.name)),
                    Pluralize(snakeCase(resource.name))
                ]
                    .sort()
                    .join('_')

                const resourceColumnName = `${snakeCase(resource.name)}_id`
                const relatedResourceColumnName = `${snakeCase(
                    relatedResource.name
                )}_id`

                const tableExists = !!oldResource

                if (this.config.client === 'sqlite3' && tableExists) {
                    return
                }

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](
                    tableName,
                    t => {
                        if (!tableExists) {
                            t.increments()
                            t.timestamps()
                        }

                        let resourceMethod = t.integer(resourceColumnName)
                        let relatedResourceMethod = t.integer(
                            relatedResourceColumnName
                        )

                        if (tableExists) {
                            resourceMethod.alter()
                            relatedResourceMethod.alter()
                        }
                    }
                )
            }
        }
    }

    private performDatabaseSchemaSync = async (
        resources: SerializedResource[] = []
    ) => {
        const knex = this.$db!

        const migrationsTableExists = await knex.schema.hasTable(
            this.migrationsTable
        )

        const oldResources: SerializedResource[] = migrationsTableExists
            ? (await knex.select('*').from(this.migrationsTable)).map(row => {
                  try {
                      return JSON.parse(row.resource_data)
                  } catch (error) {
                      return row.resource_data
                  }
              })
            : []

        if (!migrationsTableExists) {
            await knex.schema.createTable(this.migrationsTable, table => {
                table.increments()
                table.string('resource_table')
                table.json('resource_data')
            })
        }

        await knex.transaction(async trx => {
            await trx.table(this.migrationsTable).truncate()

            await trx.table(this.migrationsTable).insert(
                resources.map(resource => ({
                    resource_table: resource.table,
                    resource_data: JSON.stringify(resource)
                }))
            )

            for (let index = 0; index < resources.length; index++) {
                const resource = resources[index]

                const oldResource = oldResources.find(
                    oldResource => oldResource.name === resource.name
                )

                const tableExists = !!oldResource

                await this.handleBelongsToManyField(
                    trx,
                    resources,
                    resource,
                    oldResource
                )

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](
                    resource.table,
                    t => {
                        // if column exists on schema, but cannot be found here on fields,
                        // then it should be dropped

                        resource.fields.forEach(field => {
                            if (field.component === 'HasManyField') {
                                return
                            }

                            if (field.component === 'BelongsToManyField') {
                                return
                            }

                            return this.handleFieldUpdates(
                                trx,
                                t,
                                oldResource,
                                field
                            )
                        })

                        if (!resource.noTimeStamps && !tableExists) {
                            t.timestamps(true, true)
                        }
                    }
                )
            }
        })
    }

    private handleFieldUpdates = (
        trx: Knex.Transaction,
        table: CreateTableBuilder | AlterTableBuilder,
        oldResource: SerializedResource | undefined,
        field: SerializedField
    ) => {
        if (field.databaseFieldType === 'enu' && this.config.client === 'pg') {
            // TODO: Remove this when the enu alter() bug is fixed from the knex team.
            // This will allow any string, but we will add application
            // level validation to make sure the value
            field.databaseFieldType = 'string'
        }

        const knexMethodName = field.databaseFieldType || ''
        const tableExists = !!oldResource

        // @ts-ignore
        if (!table[knexMethodName] && table[knexMethodName] !== 'undefined') {
            console.warn(
                `The field ${field.name} is making use of an invalid database method ${field.databaseFieldType}. Make sure this method is supported by knex.`
            )
            return
        }

        const oldField = tableExists
            ? oldResource?.fields.find(oldField => field.name === oldField.name)
            : null

        if (['increments', 'bigIncrements'].includes(knexMethodName)) {
            if (!tableExists) {
                // @ts-ignore
                table[knexMethodName](field.databaseField)
            }

            return
        }

        // first let's handle all indexes. this includes primary keys, unique keys and search indexes
        // next, let's handle

        let methodArguments: any[] = [field.databaseField]

        if (knexMethodName === 'enu') {
            const selectOptions = field.selectOptions!.map(
                (option: { label: string; value: string }) => option.value
            )
            methodArguments = [field.databaseField, selectOptions]

            if (this.config.client === 'pg') {
                methodArguments = [
                    ...methodArguments,
                    {
                        useNative: true,
                        enumName: field.databaseField
                    }
                ]
            }
        }

        if (oldField && this.config.client === 'sqlite3') {
            return
        }

        // @ts-ignore
        let method: ColumnBuilder = table[knexMethodName](...methodArguments)

        // if old was unique, and new is not unique, drop unique
        if (oldField?.isUnique && !field.isUnique) {
            table.dropUnique([field.databaseField])
        }

        if (oldField?.isSearchable && !field.isSearchable) {
            table.dropIndex(field.databaseField)
        }

        if (
            field.defaultValue &&
            !['datetime', 'date', 'time', 'timestamp'].includes(knexMethodName)
        ) {
            method.defaultTo(field.defaultValue)
        }

        if (knexMethodName === 'datetime' && field.defaultToNow) {
            method.defaultTo(trx.fn.now())
        }

        if (field.isUnsigned) {
            method.unsigned()
        }

        if (field.isSearchable && !oldField?.isSearchable) {
            table.index(field.databaseField)
        }

        if (field.isUnique && !oldField?.isUnique) {
            method.unique()
        }

        if (field.isNullable === true) {
            method.nullable()
        } else {
            method.notNullable()
        }

        // if field already exists, we'll attach .alter() to it.
        // this won't work for sqlite, sigh.
        if (oldField) {
            method.alter()
        }
    }

    public create = async (
        payload: DataPayload,
        relationshipPayload: DataPayload = {}
    ) => {
        const resource = this.getCurrentResource()
        const Model = this.getResourceBookshelfModel(resource)

        const result = await Model.forge(payload).save()

        const relationshipFields = resource
            .serialize()
            .fields.filter(field => field.isRelationshipField)

        await Promise.all(
            relationshipFields.map(field => {
                const relatedResource = this.resources.find(
                    relatedResource => relatedResource.data.name === field.name
                )

                const RelatedModel = this.getResourceBookshelfModel(
                    relatedResource
                )

                if (!relatedResource) {
                    return Promise.resolve()
                }

                if (
                    field.component === 'BelongsToManyField' &&
                    relationshipPayload[field.databaseField]
                ) {
                    const builder = new Model({
                        id: result.id
                    })

                    return builder[relatedResource.data.slug]().attach(
                        relationshipPayload[field.databaseField]
                    )
                }

                if (
                    field.component === 'HasManyField' &&
                    relationshipPayload[field.databaseField]
                ) {
                    const relatedBelongsToField = relatedResource.data.fields.find(
                        field =>
                            field.component === 'BelongsToField' &&
                            field.name === resource.data.name
                    )

                    if (!relatedBelongsToField) {
                        console.warn(
                            `You must define the corresponding BelongsTo relationship for the ${resource.data.name}.`
                        )
                        return Promise.resolve()
                    }

                    return RelatedModel.query()
                        .whereIn('id', relationshipPayload[field.databaseField])
                        .update({
                            [relatedBelongsToField.databaseField]: result.id
                        })
                }

                return Promise.resolve()
            })
        )

        return result.toJSON()
    }

    public update = async (
        id: number | string,
        payload: DataPayload = {},
        relationshipPayload: DataPayload = {},
        patch = true
    ) => {
        const resource = this.getCurrentResource()
        const Model = this.getResourceBookshelfModel(resource)

        const result = await new Model({
            id
        }).save(payload, {
            patch,
            autoRefresh: true,
            method: 'update'
        })

        const relationshipFields = resource
            .serialize()
            .fields.filter(field => field.isRelationshipField)

        await Promise.all(
            relationshipFields.map(field => {
                const relatedResource = this.resources.find(
                    relatedResource => relatedResource.data.name === field.name
                )

                if (!relatedResource) {
                    return Promise.resolve()
                }

                const RelatedModel = this.getResourceBookshelfModel(
                    relatedResource
                )

                if (
                    field.component === 'BelongsToManyField' &&
                    relationshipPayload[field.databaseField]
                ) {
                    const builder = new Model({
                        id: result.id
                    })

                    return (async () => {
                        await builder[relatedResource.data.slug]().detach()

                        await builder[relatedResource.data.slug]().attach(
                            relationshipPayload[field.databaseField]
                        )
                    })()
                }

                if (
                    field.component === 'HasManyField' &&
                    relationshipPayload[field.databaseField]
                ) {
                    const relatedBelongsToField = relatedResource.data.fields.find(
                        field =>
                            field.component === 'BelongsToField' &&
                            field.name === resource.data.name
                    )

                    if (!relatedBelongsToField) {
                        return Promise.resolve()
                    }

                    return (async function() {
                        await RelatedModel.query()
                            .where(relatedBelongsToField.databaseField, id)
                            .update({
                                [relatedBelongsToField.databaseField]: null
                            })

                        await RelatedModel.query()
                            .whereIn(
                                'id',
                                relationshipPayload[field.databaseField]
                            )
                            .update({
                                [relatedBelongsToField.databaseField]: result.id
                            })
                    })()
                }

                return Promise.resolve()
            })
        )

        return result.toJSON()
    }

    public updateManyByIds = async (ids: number[], valuesToUpdate: {}) => {
        const resource = this.getCurrentResource()
        return this.$db!(resource.data.table)
            .whereIn('id', ids)
            .update(valuesToUpdate)
    }

    public updateOneByField = async (
        field: string,
        value: any,
        payload: DataPayload = {}
    ) => {
        return this.$db!(this.getCurrentResource().data.table)
            .where(field, value)
            .update(payload)
    }

    public updateManyWhere = async (whereClause: {}, valuesToUpdate: {}) => {
        const resource = this.getCurrentResource()
        return this.$db!(resource.data.table)
            .where(whereClause)
            .update(valuesToUpdate)
    }

    public deleteById = async (id: number | string) => {
        const resource = this.getCurrentResource()
        const Model = this.getResourceBookshelfModel(resource)!

        const modelToDelete = await this.findOneById(id)

        if (!modelToDelete) {
            throw {
                status: 404,
                message: `${resource.data.name} resource with id ${id} was not found.`
            }
        }

        const relationalFields = resource.data.fields.filter(
            field =>
                field.serialize().isRelationshipField ||
                field.component === 'BelongsToField'
        )

        await Promise.all([
            await Promise.all(
                relationalFields.map(field => {
                    if (['BelongsToManyField'].includes(field.component)) {
                        // update both the related resource and the resource
                        const relatedResource = this.resources.find(
                            r => r.data.name === field.name
                        )!

                        return new Model({
                            id: modelToDelete.id
                        })
                            [relatedResource.data.slug]()
                            .detach()
                    }

                    if (field.component === 'HasManyField') {
                        // get related belongs to field
                        const relatedResource = this.resources.find(
                            r => r.data.name === field.name
                        )!
                        const RelatedModel = this.getResourceBookshelfModel(
                            relatedResource
                        )!

                        const relatedBelongsToField = relatedResource.data.fields.find(
                            f =>
                                f.component === 'BelongsToField' &&
                                f.name === resource.data.name
                        )

                        if (!relatedBelongsToField) {
                            return Promise.resolve()
                        }

                        return RelatedModel.query()
                            .where(
                                relatedBelongsToField.databaseField,
                                modelToDelete.id
                            )
                            .update({
                                [relatedBelongsToField.databaseField]: null
                            })
                    }

                    return async function() {}
                })
            )
        ])

        const result = await this.$db!(resource.data.table)
            .where('id', id)
            .limit(1)
            .delete()

        return result === 1
    }

    public findAllByIds = async (
        ids: string[],
        fields?: FetchAllRequestQuery['fields']
    ) => {
        const resource = this.getCurrentResource()

        return this.$db!.select(fields || '*')
            .from(resource.data.table)
            .whereIn('id', ids)
    }

    public findOneById = async (
        id: number | string,
        fields?: FetchAllRequestQuery['fields'],
        withRelated: string[] = [],
        withHidden = false
    ) => {
        const resource = this.getCurrentResource()

        const Model = this.getResourceBookshelfModel(resource)

        let result = await new Model({ id }).fetch({
            require: false,
            columns: fields,
            withRelated
        })

        if (withHidden) {
            return result ? result.toJSON({ hidden: [] }) : null
        }

        return result ? result.toJSON() : null
    }

    public findOneByField = async (
        field: string,
        value: string,
        fields?: FetchAllRequestQuery['fields'],
        withHidden = false
    ) => {
        const resource = this.getCurrentResource()

        return (
            (
                await this.$db!.select(fields || '*')
                    .from(resource.data.table)
                    .where(field, value)
                    .limit(1)
            )[0] || null
        )
    }

    public findOneByFieldExcludingOne = async (
        field: string,
        value: string,
        excludeId: string | number,
        fields?: FetchAllRequestQuery['fields']
    ) => {
        return (
            (
                await this.$db!.select(fields || '*')
                    .from(this.getCurrentResource().data.table)
                    .where(field, value)
                    .whereNot(`id`, excludeId)
                    .limit(1)
            )[0] || null
        )
    }

    public findAllBelongingToMany = async (
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) => {
        const query = this.getDefaultQuery(baseQuery)

        const [
            countResolver,
            dataResolver
        ]: any = await this.findAllBelongingToManyResolvers(
            relatedResource,
            resourceId,
            query
        )

        const data = await dataResolver()
        const countResult = await countResolver()

        const count = countResult[0]['count(*)'] || countResult[0]['count']

        return {
            data,
            page: query.page,
            perPage: query.perPage,
            total: count as number,
            pageCount: Math.ceil((count as number) / (query.perPage || 10))
        }
    }

    async findAllHasMany(
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) {
        const query = this.getDefaultQuery(baseQuery)

        const [
            countResolver,
            dataResolver
        ] = await this.findAllHasManyResolvers(
            relatedResource,
            resourceId,
            query
        )

        const data = await dataResolver()
        const countResult = await countResolver()

        const count = countResult[0]['count(*)'] || countResult[0]['count']

        return {
            data,
            page: query.page,
            perPage: query.perPage,
            total: count as number,
            pageCount: Math.ceil((count as number) / (query.perPage || 10))
        }
    }

    async findAllHasManyData(
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) {
        const [, dataResolver] = await this.findAllHasManyResolvers(
            relatedResource,
            resourceId,
            baseQuery
        )

        return dataResolver()
    }

    async findAllHasManyCount(
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) {
        const [countResolver] = await this.findAllHasManyResolvers(
            relatedResource,
            resourceId,
            baseQuery
        )

        const count = await countResolver()

        return count[0]['count(*)'] || count[0]['count']
    }

    async findAllHasManyResolvers(
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) {
        const resource = this.getCurrentResource()

        const belongsToField = relatedResource.data.fields.find(
            field => field.name === resource.data.name
        )

        if (!belongsToField) {
            throw {
                status: 404,
                message: `Related 'belongs to' field not found between ${resource.data.name} and ${relatedResource.data.name}.`
            }
        }

        const query = this.getDefaultQuery(baseQuery)

        return this.findAllResolvers(
            {
                ...this.getDefaultQuery(baseQuery),
                filters: [
                    ...(query.filters || []),
                    {
                        field: belongsToField.databaseField,
                        value: resourceId.toString(),
                        operator: 'equals'
                    }
                ]
            },
            relatedResource
        )
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

    public findAllBelongingToManyData = async (
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) => {
        const [
            ,
            dataResolver
        ]: any = await this.findAllBelongingToManyResolvers(
            relatedResource,
            resourceId,
            this.getDefaultQuery(baseQuery)
        )

        const data = await dataResolver()

        return data
    }

    public findAllBelongingToManyCount = async (
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) => {
        const [countResolver]: any = await this.findAllBelongingToManyResolvers(
            relatedResource,
            resourceId,
            this.getDefaultQuery(baseQuery)
        )

        const count = await countResolver()

        return count[0]['count(*)'] || count[0]['count']
    }

    public findAllBelongingToManyResolvers = async (
        relatedResource: ResourceContract,
        resourceId: string | number,
        baseQuery: FetchAllRequestQuery
    ) => {
        const resource = this.getCurrentResource()

        const query = this.getDefaultQuery(baseQuery)

        const getBuilder = (builder: any) => {
            if (query.search) {
                const searchableFields = relatedResource.data.fields.filter(
                    field => field.isSearchable
                )

                builder.where((qb: any) => {
                    searchableFields.forEach((field, index) => {
                        qb[index === 0 ? 'where' : 'orWhere'](
                            `${relatedResource.data.table}.${field.databaseField}`,
                            'like',
                            `%${query.search.toLowerCase()}%`
                        )
                    })
                })
            }

            builder = this.handleFilterQueries(query.filters, builder)

            return builder
        }

        const resourceColumnName = `${snakeCase(resource.data.name)}_id`
        const relatedResourceColumnName = `${snakeCase(
            relatedResource.data.name
        )}_id`

        const tableName = [
            Pluralize(snakeCase(relatedResource.data.name)),
            Pluralize(snakeCase(resource.data.name))
        ]
            .sort()
            .join('_')

        return [
            () =>
                getBuilder(
                    this.$db!(relatedResource.data.table)
                        .count()
                        .innerJoin(
                            tableName,
                            `${tableName}.${relatedResourceColumnName}`,
                            `${relatedResource.data.table}.id`
                        )
                        .where(`${tableName}.${resourceColumnName}`, resourceId)
                ),
            () =>
                getBuilder(
                    this.$db!(relatedResource.data.table)
                        .innerJoin(
                            tableName,
                            `${tableName}.${relatedResourceColumnName}`,
                            `${relatedResource.data.table}.id`
                        )
                        .where(`${tableName}.${resourceColumnName}`, resourceId)
                )
                    .limit(query.perPage)
                    .offset((query.page - 1) * query.perPage)
        ]
    }

    public handleFilterQueries = (
        filters: FetchAllRequestQuery['filters'],
        builder: Knex
    ): Knex => {
        ;(filters || []).forEach(filter => {
            if (filter.operator === 'is_null') {
                builder.whereNull(filter.field)

                return
            }

            if (filter.operator === 'not_null') {
                builder.whereNotNull(filter.field)

                return
            }

            if (filter.operator === 'gt') {
                builder.where(filter.field, '>', filter.value)

                return
            }

            if (filter.operator === 'gte') {
                builder.where(filter.field, '>=', filter.value)

                return
            }

            if (filter.operator === 'lt') {
                builder.where(filter.field, '<', filter.value)

                return
            }

            if (filter.operator === 'lte') {
                builder.where(filter.field, '<=', filter.value)

                return
            }

            if (filter.operator === 'contains') {
                builder.where(filter.field, 'like', `%${filter.value}%`)

                return
            }

            if (filter.operator === 'equals') {
                builder.where(filter.field, '=', filter.value)

                return
            }

            if (filter.operator === 'not_equals') {
                builder.whereNot(filter.field, '=', filter.value)

                return
            }

            if (filter.operator === 'in') {
                builder.whereIn(filter.field, filter.value.split(','))

                return
            }

            if (filter.operator === 'not_in') {
                builder.whereNotIn(filter.field, filter.value.split(','))

                return
            }
        })

        return builder
    }

    public findAllData = async (baseQuery: FetchAllRequestQuery) => {
        const [, dataResolver]: any = this.findAllResolvers(
            this.getDefaultQuery(baseQuery)
        )

        const results = await dataResolver()

        return results
    }

    public findAllCount = async (baseQuery?: FetchAllRequestQuery) => {
        const query = this.getDefaultQuery(baseQuery || {})

        const [countResolver]: any = this.findAllResolvers(query)

        const count = await countResolver()

        return count[0]['count(*)'] || count[0]['count'] || 0
    }

    public findAll = async (baseQuery: FetchAllRequestQuery) => {
        const query = this.getDefaultQuery(baseQuery)

        const [countResolver, dataResolver]: any = this.findAllResolvers(query)

        const count = await countResolver()
        const total = count[0]['count(*)'] || count[0]['count']

        const results = await dataResolver()

        return {
            data: results,
            page: query.page,
            total: parseInt(total),
            perPage: query.perPage,
            pageCount: Math.ceil(total / query.perPage)
        }
    }

    public findAllResolvers = (
        baseQuery: FetchAllRequestQuery,
        resource = this.getCurrentResource()
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const query = this.getDefaultQuery(baseQuery)

        const getBuilder = () => {
            let builder = Model.query()

            if (query.search) {
                const searchableFields = resource.data.fields.filter(
                    field => field.isSearchable
                )

                builder.where((qb: any) => {
                    searchableFields.forEach((field, index) => {
                        qb[index === 0 ? 'where' : 'orWhere'](
                            field.databaseField,
                            'like',
                            `%${query.search.toLowerCase()}%`
                        )
                    })
                })
            }

            builder = this.handleFilterQueries(query.filters, builder)

            return builder
        }

        return [
            () => getBuilder().count(),
            () =>
                getBuilder()
                    .select(query.fields || '*')
                    .limit(query.perPage)
                    .offset((query.page - 1) * query.perPage)
        ]
    }
}
