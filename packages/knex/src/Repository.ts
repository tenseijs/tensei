import Knex, {
    CreateTableBuilder,
    ColumnBuilder,
    AlterTableBuilder,
} from 'knex'
import Pluralize from 'pluralize'
import Bookshelf from 'bookshelf'
import { snakeCase, sentenceCase } from 'change-case'

import {
    DatabaseRepositoryInterface,
    User,
    SerializedResource,
    SerializedField,
    Config,
    ResourceContract,
    DataPayload,
    FetchAllRequestQuery,
    resource,
} from '@tensei/common'

export class SqlRepository implements DatabaseRepositoryInterface {
    private $db: Knex | null = null

    private config: Knex.Config = {}

    private bookshelfModels: any[] = []

    private resources: Config['resources'] = []

    private connectionEstablished: boolean = false

    public static databases = ['mysql', 'pg']

    public establishDatabaseConnection = () => {
        if (!this.connectionEstablished) {
            this.$db = Knex(this.config)
        }

        this.connectionEstablished = true
    }

    public setup = async (config: Config) => {
        let connection: Knex.Config['connection'] = config.env.databaseUrl

        if (config.env.database === 'sqlite3') {
            connection = {
                filename: config.env.databaseUrl!,
            }
        }

        this.config = {
            connection,
            useNullAsDefault: true,
            client: config.env.database,
            debug: false,
        }

        this.resources = config.resources

        this.establishDatabaseConnection()

        await this.performDatabaseSchemaSync(
            config.resources.map((resource) => resource.serialize())
        )

        await this.bootBookshelfModels()

        await this.setupRolesAndPermissions()

        return this.$db
    }

    public setResourceModels = (resources: ResourceContract[]) =>
        resources.map((resource, index) => {
            resource.Model = () => this.bookshelfModels[index]

            return resource
        })

    private getResourceBookshelfModel = (resource: ResourceContract) => {
        return this.bookshelfModels.find(
            (model) => model.resourceName === resource.data.name
        )
    }

    private setupRolesAndPermissions = async () => {
        const permissions: string[] = []

        this.resources.forEach((resource) => {
            ;['create', 'read', 'update', 'delete'].forEach((operation) => {
                permissions.push(`${operation}:${resource.data.slug}`)
                resource.data.fields.forEach((field) => {
                    permissions.push(
                        `${operation}:${resource.data.slug}:${field.databaseField}`
                    )
                })
            })

            resource.data.actions.forEach((action) => {
                permissions.push(
                    `run:${resource.data.slug}:${action.data.slug}`
                )
            })
        })

        const roleResource = this.resources.find(
            (resource) => resource.data.name === 'Administrator Role'
        )
        const permissionResource = this.resources.find(
            (resource) => resource.data.name === 'Administrator Permission'
        )

        if (!roleResource || !permissionResource) {
            throw {
                message: 'Role and Permission resources must be defined.',
                status: 500,
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
            (permission) => !existingPermissions.includes(permission)
        )

        await PermissionModel.query().insert(
            newPermissionsToCreate.map((permission) => ({
                name: sentenceCase(permission.split(':').join(' ')),
                slug: permission,
            }))
        )

        let superAdminRole = (
            await RoleModel.query().where('slug', 'super-admin').limit(1)
        )[0]

        if (!superAdminRole) {
            await RoleModel.query().insert({
                name: 'Super Admin',
                slug: 'super-admin',
            })

            superAdminRole = (
                await RoleModel.query().where('slug', 'super-admin').limit(1)
            )[0]
        }

        const allPermissions = await PermissionModel.query()

        await new RoleModel({
            id: superAdminRole.id,
        })
            [permissionResource.data.slug]()
            .detach()

        await new RoleModel({
            id: superAdminRole.id,
        })
            [permissionResource.data.slug]()
            .attach(allPermissions.map((permission: any) => permission.id))
    }

    private bootBookshelfModels = async () => {
        const bookshelfInstance = Bookshelf(this.$db!)

        const bookshelfModels = this.resources.map((resource) => {
            const hiddenFields = resource
                .serialize()
                .fields.filter((field) => field.hidden)
                .map((field) => field.databaseField)

            const model: any = {
                hidden: hiddenFields,
                tableName: resource.data.table,
                hasTimestamps: !resource.data.noTimeStamps,
            }

            resource.data.fields.forEach((field) => {
                const relatedResource = this.resources.find(
                    (relatedResource) =>
                        field.name === relatedResource.data.name
                )
                if (!relatedResource) {
                    return
                }

                if (field.component === 'BelongsToField') {
                    model[
                        relatedResource.data.name.toLowerCase()
                    ] = function () {
                        return this.belongsTo(relatedResource.data.name)
                    }
                }

                if (field.component === 'HasManyField') {
                    model[relatedResource.data.slug] = function () {
                        return this.hasMany(relatedResource.data.name)
                    }
                }

                if (field.component === 'BelongsToManyField') {
                    model[relatedResource.data.slug] = function () {
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

    public handleBelongsToManyField = async (
        trx: Knex.Transaction,
        resources: SerializedResource[],
        resource: SerializedResource,
        schema: any
    ) => {
        const belongsToManyFields = resource.fields.filter(
            (field) => field.component === 'BelongsToManyField'
        )

        for (let index = 0; index < belongsToManyFields.length; index++) {
            const field = belongsToManyFields[index]

            if (field.component === 'BelongsToManyField') {
                const relatedResource = resources.find(
                    (relatedResource) => field.name === relatedResource.name
                )

                const indexOfResource = resources.findIndex(
                    (indexResource) => resource.name === indexResource.name
                )

                const indexOfRelatedResource = resources.findIndex(
                    (relatedResource) => field.name === relatedResource.name
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
                    Pluralize(snakeCase(resource.name)),
                ]
                    .sort()
                    .join('_')

                const resourceColumnName = `${snakeCase(resource.name)}_id`
                const relatedResourceColumnName = `${snakeCase(
                    relatedResource.name
                )}_id`

                const tableExists = schema ? schema[tableName] : false

                const resourceColumnExists = tableExists
                    ? schema[tableName][resourceColumnName]
                    : false
                const relatedResourceColumnExists = tableExists
                    ? schema[tableName][relatedResourceColumnName]
                    : false

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](
                    tableName,
                    (t) => {
                        if (!tableExists) {
                            t.increments()
                        }

                        let resourceMethod = t.integer(resourceColumnName)
                        let relatedResourceMethod = t.integer(
                            relatedResourceColumnName
                        )

                        if (resourceColumnExists) {
                            resourceMethod.alter()
                        }

                        if (relatedResourceColumnExists) {
                            relatedResourceMethod.alter()
                        }

                        if (!tableExists) {
                            t.timestamps()
                        }
                    }
                )
            }
        }
    }

    public performDatabaseSchemaSync = async (
        resources: SerializedResource[] = []
    ) => {
        const knex = this.$db!

        const schema = await this.getDatabaseSchema()

        await knex.transaction(async (trx) => {
            for (let index = 0; index < resources.length; index++) {
                const resource = resources[index]

                const tableExists = schema ? schema[resource.table] : false

                this.handleBelongsToManyField(trx, resources, resource, schema)

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](
                    resource.table,
                    (t) => {
                        // if column exists on schema, but cannot be found here on fields,
                        // then it should be dropped

                        resource.fields.forEach((field) => {
                            if (field.component === 'HasManyField') {
                                return
                            }

                            if (field.component === 'BelongsToManyField') {
                                return
                            }

                            return this.handleFieldUpdates(
                                trx,
                                t,
                                schema,
                                field,
                                resource,
                                resources
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

    private getDatabaseSchema = async () => {
        try {
            // TODO: Make sure this works for all supported databases. not just mysql.
            return this.parseMysqlDatabaseSchema(
                ...(await Promise.all([
                    this.$db!('information_schema.columns').where(
                        'table_schema',
                        this.$db!.client.config.connection.database
                    ),
                    this.$db!('information_schema.statistics').where(
                        'table_schema',
                        this.$db!.client.config.connection.database
                    ),
                ]))
            )
        } catch (errors) {
            return null
        }
    }

    private handleFieldUpdates = (
        trx: Knex.Transaction,
        table: CreateTableBuilder | AlterTableBuilder,
        schema: any = null,
        field: SerializedField,
        resource: SerializedResource,
        resources: SerializedResource[]
    ) => {
        const knexMethodName = field.sqlDatabaseFieldType || ''
        const tableExists = schema ? schema[resource.table] : false

        // @ts-ignore
        if (!table[knexMethodName] && table[knexMethodName] !== 'undefined') {
            console.warn(
                `The field ${field.name} is making use of an invalid database method ${field.sqlDatabaseFieldType}. Make sure this method is supported by knex.`
            )
            return
        }

        const matchingDatabaseField = tableExists
            ? schema[resource.table][field.databaseField]
            : null

        const columnHasIndex = matchingDatabaseField
            ? matchingDatabaseField.indexes.find((index: any) => {
                  // TODO: If we allow custom index names in future, we'll check for the custom name here.
                  return (
                      index.INDEX_NAME ===
                      `${resource.table}_${field.databaseField}_index`
                  )
              })
            : false

        const columnIsUnique = matchingDatabaseField
            ? matchingDatabaseField.indexes.find((index: any) => {
                  return (
                      index.INDEX_NAME ===
                      `${resource.table}_${field.databaseField}_unique`
                  )
              })
            : false

        // first let's handle all indexes. this includes primary keys, unique keys and search indexes
        // next, let's handle
        if (['increments', 'bigIncrements'].includes(knexMethodName)) {
            if (!tableExists) {
                // @ts-ignore
                table[knexMethodName](field.databaseField)
            }

            return
        }

        let methodArguments: any[] = [field.databaseField]

        if (knexMethodName === 'enu') {
            const selectOptions = field.selectOptions!.map(
                (option: { label: string; value: string }) => option.value
            )
            methodArguments = [field.databaseField, selectOptions]
        }

        // @ts-ignore
        let method: ColumnBuilder = table[knexMethodName](...methodArguments)

        // if old was unique, and new is not unique, drop unique
        if (columnIsUnique && !field.isUnique) {
            table.dropUnique(matchingDatabaseField.name)
        }

        if (columnHasIndex && !field.isSearchable) {
            table.dropIndex(matchingDatabaseField.name)
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

        if (field.isSearchable && !columnHasIndex) {
            table.index(field.databaseField)
        }

        if (field.isUnique && !columnIsUnique) {
            method.unique()
        }

        if (field.isNullable === true) {
            method.nullable()
        } else {
            method.notNullable()
        }

        // if field already exists, we'll attach .alter() to it.
        // this won't work for sqlite, sigh.
        if (matchingDatabaseField) {
            method.alter()
        }
    }

    private parseMysqlDatabaseSchema = (
        schema: any[],
        schemaStatistics: any[] = []
    ) => {
        let tables: {
            [key: string]: {
                [key: string]: {}
            }
        } = {}

        schema.forEach((column) => {
            let fieldType = column.DATA_TYPE

            let indexes =
                schemaStatistics.filter(
                    (columnData) =>
                        column.COLUMN_NAME === columnData.COLUMN_NAME
                ) || []

            tables[column.TABLE_NAME] = {
                ...(tables[column.TABLE_NAME] || {}),
                [column.COLUMN_NAME]: {
                    fieldType,
                    indexes,
                    name: column.COLUMN_NAME,
                    isPrimaryKey: column.COLUMN_KEY === 'PRI',
                    isNullable: column.IS_NULLABLE === 'YES',
                    isUnique: column.COLUMN_KEY === 'UNI',
                    numericPrecision: column.NUMERIC_PRECISION,
                    autoIncrements: !!column.EXTRA.match(/auto_increment/),
                    unsigned: !!column.COLUMN_TYPE.match(/unsigned/),
                },
            }
        })

        return tables
    }

    public findUserByEmail = async (email: string) => {
        return this.$db!('administrators')
            .where('email', email)
            .limit(1)
            .then(([administrator]) => {
                return administrator || null
            })
    }

    public getAdministratorsCount = async () => {
        return this.$db!('administrators')
            .count()
            .then(([count]) => parseInt(count['count(*)'] as string))
    }

    public create = async (
        resource: ResourceContract,
        payload: DataPayload,
        relationshipPayload: DataPayload
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const result = await Model.forge(payload).save()

        const relationshipFields = resource
            .serialize()
            .fields.filter((field) => field.isRelationshipField)

        await Promise.all(
            relationshipFields.map((field) => {
                const relatedResource = this.resources.find(
                    (relatedResource) =>
                        relatedResource.data.name === field.name
                )

                if (!relatedResource) {
                    return Promise.resolve()
                }

                if (
                    field.component === 'BelongsToManyField' &&
                    relationshipPayload[field.databaseField]
                ) {
                    const builder = new Model({
                        id: result.id,
                    })

                    return builder[relatedResource.data.slug]().attach(
                        relationshipPayload[field.databaseField]
                    )
                }

                if (
                    field.component === 'HasManyField' &&
                    relationshipPayload[field.databaseField]
                ) {
                    console.log(
                        'TODO: Handle HasManyField after resource is created.'
                    )
                }

                return Promise.resolve()
            })
        )

        return result
    }

    public update = async (
        resource: ResourceContract,
        id: number | string,
        payload: DataPayload = {},
        relationshipPayload: DataPayload = {},
        patch = true
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const result = await new Model({
            id,
        }).save(payload, {
            patch,
            autoRefresh: true,
            method: 'update',
        })

        const relationshipFields = resource
            .serialize()
            .fields.filter((field) => field.isRelationshipField)

        await Promise.all(
            relationshipFields.map((field) => {
                const relatedResource = this.resources.find(
                    (relatedResource) =>
                        relatedResource.data.name === field.name
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
                        id: result.id,
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
                        (field) =>
                            field.component === 'BelongsToField' &&
                            field.name === resource.data.name
                    )

                    if (!relatedBelongsToField) {
                        console.warn(
                            `You must define the corresponding BelongsTo relationship for the ${resource.data.name}.`
                        )
                        return
                    }

                    return (async function () {
                        await RelatedModel.query()
                            .where(relatedBelongsToField.databaseField, id)
                            .update({
                                [relatedBelongsToField.databaseField]: null,
                            })

                        await RelatedModel.query()
                            .whereIn(
                                'id',
                                relationshipPayload[field.databaseField]
                            )
                            .update({
                                [relatedBelongsToField.databaseField]:
                                    result.id,
                            })
                    })()
                }

                return Promise.resolve()
            })
        )

        return result
    }

    public updateManyByIds = async (
        resource: ResourceContract,
        ids: number[],
        valuesToUpdate: {}
    ) => {
        return this.$db!(resource.data.table)
            .whereIn('id', ids)
            .update(valuesToUpdate)
    }

    public updateManyWhere = async (
        resource: ResourceContract,
        whereClause: {},
        valuesToUpdate: {}
    ) => {
        return this.$db!(resource.data.table)
            .where(whereClause)
            .update(valuesToUpdate)
    }

    public deleteById = async (
        resource: ResourceContract,
        id: number | string
    ) => {
        const result = await this.$db!(resource.data.table)
            .where('id', id)
            .limit(1)
            .delete()

        if (result === 0) {
            throw [
                {
                    message: `${resource.data.name} resource with id ${id} was not found.`,
                },
            ]
        }

        return result
    }

    public findAllByIds = async (
        resource: ResourceContract,
        ids: number[],
        fields?: FetchAllRequestQuery['fields']
    ) => {
        return this.$db!.select(fields || '*')
            .from(resource.data.table)
            .whereIn('id', ids)
    }

    public findOneById = async (
        resource: ResourceContract,
        id: number | string,
        fields?: FetchAllRequestQuery['fields'],
        withRelated: string[] = []
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        let result = await new Model({ id }).fetch({
            require: false,
            columns: fields,
            withRelated,
        })

        return result
    }

    public findOneByField = async (
        resource: ResourceContract,
        field: string,
        value: string,
        fields?: FetchAllRequestQuery['fields']
    ) => {
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
        resource: ResourceContract,
        field: string,
        value: string,
        excludeId: string | number,
        fields?: FetchAllRequestQuery['fields']
    ) => {
        return (
            (
                await this.$db!.select(fields || '*')
                    .from(resource.data.table)
                    .where(field, value)
                    .whereNot(`id`, excludeId)
                    .limit(1)
            )[0] || null
        )
    }

    public findAllBelongingToMany = async (
        resource: ResourceContract,
        relatedResource: ResourceContract,
        resourceId: string | number,
        query: FetchAllRequestQuery
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const getBuilder = (builder: any) => {
            if (query.search) {
                const searchableFields = relatedResource.data.fields.filter(
                    (field) => field.isSearchable
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
            Pluralize(snakeCase(resource.data.name)),
        ]
            .sort()
            .join('_')

        const count = (
            await getBuilder(
                this.$db!(relatedResource.data.table)
                    .count()
                    .innerJoin(
                        tableName,
                        `${tableName}.${relatedResourceColumnName}`,
                        `${relatedResource.data.table}.id`
                    )
            ).andWhere(`${tableName}.${resourceColumnName}`, resourceId)
        )[0]['count(*)']

        const data = await Model.forge({
            id: resourceId,
        }).fetch({
            withRelated: [
                {
                    [relatedResource.data.slug]: function (builder: any) {
                        return getBuilder(builder)
                            .select(
                                query.fields.map(
                                    (field) =>
                                        `${relatedResource.data.table}.${field}`
                                )
                            )
                            .limit(query.perPage)
                            .offset((query.page - 1) * query.perPage)
                    },
                },
            ],
        })

        return {
            page: query.page,
            perPage: query.perPage,
            total: count as number,
            pageCount: Math.ceil((count as number) / query.perPage),
            data: data.relations[relatedResource.data.slug].models,
        }
    }

    public handleFilterQueries = (
        filters: FetchAllRequestQuery['filters'],
        builder: Knex
    ): Knex => {
        filters.forEach((filter) => {
            if (filter.operator === 'null') {
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
        })

        return builder
    }

    public findAll = async (
        resource: ResourceContract,
        query: FetchAllRequestQuery
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const getBuilder = () => {
            let builder = Model.query()

            if (query.search) {
                const searchableFields = resource.data.fields.filter(
                    (field) => field.isSearchable
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

        const count = await getBuilder().count()

        const data = getBuilder()

        let results = await data
            .select(query.fields || '*')
            .limit(query.perPage)
            .offset((query.page - 1) * query.perPage)

        const total = count[0]['count(*)']

        return {
            total,
            data: results,
            page: query.page,
            perPage: query.perPage,
            pageCount: Math.ceil(total / query.perPage),
        }
    }

    public getAdministratorById = async (id: number | string) => {
        const AdminModel = this.resources
            .find((resource) => resource.data.slug === 'administrators')
            ?.Model()

        let admin = await new AdminModel({
            id,
        }).fetch({
            withRelated: ['administrator-roles.administrator-permissions'],
            require: false,
        })

        if (!admin) {
            return null
        }

        admin = admin.toJSON()

        return {
            name: admin.name,
            email: admin.email,
            id: admin.id as number,
            roles: (admin['administrator-roles'] || []).map((role: any) => ({
                id: role.id,
                name: role.name,
                slug: role.slug,
            })),
            permissions: admin['administrator-roles'].reduce(
                (acc: [], role: any) => [
                    ...acc,
                    ...(role['administrator-permissions'] || []).map(
                        (permission: any) => permission.slug
                    ),
                ],
                []
            ),
        }
    }
}
