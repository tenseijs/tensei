import Knex, {
    CreateTableBuilder,
    ColumnBuilder,
    AlterTableBuilder,
} from 'knex'

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
            debug: true,
        }

        this.establishDatabaseConnection()

        await this.performDatabaseSchemaSync(
            config.resources.map((resource) => resource.serialize())
        )

        return this.$db
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

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](
                    resource.table,
                    (t) => {
                        // if column exists on schema, but cannot be found here on fields,
                        // then it should be dropped

                        resource.fields.forEach((field) =>
                            this.handleFieldUpdates(
                                trx,
                                t,
                                schema,
                                field,
                                resource,
                                resources
                            )
                        )

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
        if (!table[knexMethodName]) {
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

    public create = async (resource: Resource, payload: DataPayload) => {
        const modelId = (
            await this.$db!(resource.data.table).insert(payload)
        )[0]

        return this.findOneById(resource, modelId)
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
        fields?: FetchAllRequestQuery['fields']
    ) => {
        return (
            (
                await this.$db!.select(fields || '*')
                    .from(resource.data.table)
                    .where('id', id)
                    .limit(1)
            )[0] || null
        )
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

    public findAll = async (
        resource: Resource,
        query: FetchAllRequestQuery
    ) => {
        const getBuilder = () => {
            let builder = this.$db!(resource.data.table)

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

            return builder
        }

        const countResult = await getBuilder().count()

        const total = parseInt(countResult[0]['count(*)'] as string)

        return {
            total,
            page: query.page,
            data: await getBuilder()
                .limit(query.perPage)
                .offset((query.page - 1) * query.perPage)
                .select(query.fields || '*'),
            perPage: query.perPage,
            pageCount: Math.ceil(total / query.perPage),
        }
    }
}
