import Knex, {
    CreateTableBuilder,
    ColumnBuilder,
    AlterTableBuilder,
} from 'knex'
import Pluralize from 'pluralize'
import Bookshelf from 'bookshelf'
import { snakeCase } from 'change-case'

import {
    DatabaseRepositoryInterface,
    User,
    SerializedResource,
    SerializedField,
    FlamingoConfig,
    Resource,
    DataPayload,
} from '@flamingo/common'
import { FetchAllRequestQuery } from '@flamingo/common/src/config'

export class SqlRepository implements DatabaseRepositoryInterface {
    private $db: Knex | null = null

    private config: Knex.Config = {}

    private bookshelfModels: any[] = []

    private resources: FlamingoConfig['resources'] = []

    private connectionEstablished: boolean = false

    public static databases = ['mysql', 'pg']

    public establishDatabaseConnection = () => {
        if (!this.connectionEstablished) {
            this.$db = Knex(this.config)
        }

        this.connectionEstablished = true
    }

    public setup = async (config: FlamingoConfig) => {
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

        return this.$db
    }

    private getResourceBookshelfModel = (resource: Resource) => {
        return this.bookshelfModels.find(
            (model) => model.resourceName === resource.data.name
        )
    }

    private bootBookshelfModels = async () => {
        const bookshelfInstance = Bookshelf(this.$db!)

        const bookshelfModels = this.resources.map((resource) => {
            const model: any = {
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
            // If field === belongsToMany
            // First, get the related belongsToMany resource.
            // Second, Get the default table name.
            // This would be the alphabetically sorted singular names of each resource separated by _. For example, User, Role => role_user, Post, Tag => post_tag
            // Third, check if the table already exists
            // If it doesn't, create it.
            // Else, update it.
            // Fourth, create four new fields in this table:
            // role_id, user_id, created_at, updated_at, and other custom fields in the pivot table

            if (field.component === 'BelongsToManyField') {
                const relatedResource = resources.find(
                    (relatedResource) => field.name === relatedResource.name
                )

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
            !['datetime', 'date', 'time'].includes(knexMethodName)
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
        resource: Resource,
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

                    return builder[field.databaseField](
                        relatedResource.data.slug
                    ).attach(relationshipPayload[field.databaseField])
                }

                return Promise.resolve()
            })
        )

        return result
    }

    public update = async (
        resource: Resource,
        id: number | string,
        payload: DataPayload = {},
        relationshipPayload: DataPayload = {},
        patch = true
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const result = await Model.forge({
            id,
        }).save(payload, {
            patch,
            autoRefresh: true,
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
                        await builder[field.databaseField](
                            relatedResource.data.slug
                        ).detach()

                        await builder[field.databaseField](
                            relatedResource.data.slug
                        ).attach(relationshipPayload[field.databaseField])
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
        resource: Resource,
        ids: number[],
        valuesToUpdate: {}
    ) => {
        return this.$db!(resource.data.table)
            .whereIn('id', ids)
            .update(valuesToUpdate)
    }

    public updateManyWhere = async (
        resource: Resource,
        whereClause: {},
        valuesToUpdate: {}
    ) => {
        return this.$db!(resource.data.table)
            .where(whereClause)
            .update(valuesToUpdate)
    }

    public deleteById = async (resource: Resource, id: number | string) => {
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
        resource: Resource,
        ids: number[],
        fields?: FetchAllRequestQuery['fields']
    ) => {
        return this.$db!.select(fields || '*')
            .from(resource.data.table)
            .whereIn('id', ids)
    }

    public findOneById = async (
        resource: Resource,
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
        resource: Resource,
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
        resource: Resource,
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

    public findAll = async (
        resource: Resource,
        query: FetchAllRequestQuery
    ) => {
        const Model = this.getResourceBookshelfModel(resource)

        const getBuilder = () => {
            const builder = Model.query()

            if (query.search) {
                const searchableFields = resource.data.fields.filter(
                    (field) => field.isSearchable
                )

                searchableFields.forEach((field, index) => {
                    builder[index === 0 ? 'where' : 'orWhere'](
                        field.databaseField,
                        'like',
                        `%${query.search.toLowerCase()}%`
                    )
                })
            }

            query.whereQueries?.forEach((whereQuery) => {
                builder.where(whereQuery.field, whereQuery.value)
            })

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
            total: count[0]['count(*)'],
            data: results,
            page: query.page,
            perPage: query.perPage,
            pageCount: Math.ceil(total / query.perPage),
        }
    }
}
