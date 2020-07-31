import Knex, { CreateTableBuilder, ColumnBuilder } from 'knex'
import Path from 'path'

import Text from '../fields/Text'
import Resource from '../resources/Resource'

class SqlRepository {
    private $db: Knex | null = null

    public establishDatabaseConnection = async () => {
        this.$db = Knex({
            client: 'mysql',
            connection: {
                host: '127.0.0.1',
                user: 'root',
                password: '',
                database: 'flmg',
            },
            useNullAsDefault: true,
            debug: true,
        })
    }

    public performDatabaseSchemaSync = async (resources: Resource[] = []) => {
        await this.establishDatabaseConnection()

        const knex = this.$db!
        let schemaTableExists = true

        const schema = await this.getDatabaseSchema()

        if (schema === null) {
            schemaTableExists = false
        }

        if (!schemaTableExists) {
            const results = await knex.transaction(async (trx) => {
                for (let index = 0; index < resources.length; index++) {
                    const resource = resources[index]

                    const tableExists = await trx.schema.hasTable(
                        resource.table()
                    )

                    if (!tableExists) {
                        await trx.schema.createTable(resource.table(), (t) => {
                            resource
                                .serializeWithPrivate()
                                .fields.forEach((field) => {
                                    const knexMethodName =
                                        field.sqlDatabaseFieldType

                                    // @ts-ignore
                                    if (t[knexMethodName]) {
                                        // @ts-ignore
                                        let method: ColumnBuilder = t[
                                            knexMethodName
                                        ](field.databaseField)

                                        if (
                                            field.defaultValue &&
                                            ![
                                                'datetime',
                                                'date',
                                                'time',
                                            ].includes(knexMethodName)
                                        ) {
                                            method.defaultTo(field.defaultValue)
                                        }

                                        if (
                                            knexMethodName === 'datetime' &&
                                            field.defaultToNow
                                        ) {
                                            method.defaultTo(trx.fn.now())
                                        }

                                        if (field.isUnsigned) {
                                            method.unsigned()
                                        }

                                        if (field.isUnique) {
                                            method.unique()
                                        }

                                        if (field.isNullable === true) {
                                            method.nullable()
                                        } else {
                                            method.notNullable()
                                        }
                                    }
                                })

                            if (!resource.noTimeStamps()) {
                                t.timestamps()
                            }
                        })
                    }
                }
            })

            console.log('------>', results)
        }
    }

    private getDatabaseSchema = async () => {
        try {
            const schemaTableExists = await this.$db?.schema.hasTable(
                'db_schema'
            )

            if (!schemaTableExists) {
                return null
            }

            return this.$db!.table('db_schema').select(['name', 'fields'])
        } catch (errors) {
            return null
        }
    }
}

export default SqlRepository
