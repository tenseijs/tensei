import Knex, {
    CreateTableBuilder,
    ColumnBuilder,
    AlterTableBuilder,
} from 'knex'

import Resource from '../resources/ResourceManager'

class SqlRepository {
    private $db: Knex | null = null

    public establishDatabaseConnection = async () => {
        this.$db = Knex({
            client: 'mysql',
            connection: 'mysql://root@127.0.0.1/flmg',
            useNullAsDefault: true,
            debug: true,
        })
    }

    public performDatabaseSchemaSync = async (resources: Resource[] = []) => {
        await this.establishDatabaseConnection()

        const knex = this.$db!

        const schema = await this.getDatabaseSchema()

        await knex.transaction(async (trx) => {
            for (let index = 0; index < resources.length; index++) {
                const resource = resources[index]

                const tableExists = schema ? schema[resource.table()] : false

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](
                    resource.table(),
                    (t) => {
                        // if column exists on schema, but cannot be found here on fields,
                        // then it should be dropped

                        resource
                            .serializeWithPrivate()
                            .fields.forEach((field) =>
                                this.handleFieldUpdates(
                                    trx,
                                    t,
                                    schema,
                                    field,
                                    resource,
                                    resources
                                )
                            )

                        if (!resource.noTimeStamps() && !tableExists) {
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
                        'flmg'
                    ),
                    this.$db!('information_schema.key_column_usage').where(
                        'table_schema',
                        'flmg'
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
        field: any = null,
        resource: Resource,
        resources: Resource[]
    ) => {
        const knexMethodName = field.sqlDatabaseFieldType
        const tableExists = schema ? schema[resource.table()] : false

        // @ts-ignore
        if (!table[knexMethodName]) {
            console.warn(
                `The field ${field.name} is making use of an invalid database method ${field.sqlDatabaseFieldType}. Make sure this method is supported by knex.`
            )
            return
        }

        const matchingDatabaseField = tableExists
            ? schema[resource.table()][field.databaseField]
            : null

        // first let's handle all indexes. this includes primary keys, unique keys and search indexes
        // next, let's handle
        if (['increments', 'bigIncrements'].includes(knexMethodName)) {
            if (!tableExists) {
                // @ts-ignore
                table[knexMethodName](field.databaseField)
            }

            return
        }

        let methodArguments = [field.databaseField]

        if (knexMethodName === 'enu') {
            methodArguments = [
                ...methodArguments,
                field.selectOptions.map(
                    (option: { label: string; value: string }) => option.value
                ),
            ]
        }

        // @ts-ignore
        let method: ColumnBuilder = table[knexMethodName](...methodArguments)

        // if old was unique, and new is not unique, drop unique
        if (matchingDatabaseField) {
            if (matchingDatabaseField.isUnique && !field.isUnique) {
                table.dropUnique(matchingDatabaseField.name)
            }

            if (matchingDatabaseField.hasIndex && !field.isSearchable) {
                table.dropIndex(matchingDatabaseField.name)
            }
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

        if (field.isSearchable && !(matchingDatabaseField || {}).hasIndex) {
            table.index(field.databaseField)
        }

        if (field.isUnique && !(matchingDatabaseField || {}).isUnique) {
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
        schema: Array<any>,
        keyColumnData: Array<any> = []
    ) => {
        let tables: {
            [key: string]: {
                [key: string]: {}
            }
        } = {}

        schema.forEach((column) => {
            let fieldType = column.DATA_TYPE

            let foreignReference = keyColumnData.find(
                (columnData) => column.COLUMN_NAME === columnData.COLUMN_NAME
            )

            const isForeign = !!(
                foreignReference?.REFERENCED_COLUMN_NAME &&
                foreignReference?.REFERENCED_TABLE_NAME
            )

            tables[column.TABLE_NAME] = {
                ...(tables[column.TABLE_NAME] || {}),
                [column.COLUMN_NAME]: {
                    fieldType,
                    isForeign,
                    hasIndex: !isForeign && column.COLUMN_KEY === 'MUL',
                    name: column.COLUMN_NAME,
                    refTableName: foreignReference?.REFERENCED_TABLE_NAME,
                    refColumnName: foreignReference?.REFERENCED_COLUMN_NAME,
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
}

export default SqlRepository
