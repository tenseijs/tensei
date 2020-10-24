import Knex, { ColumnBuilder } from 'knex'
import { MikroORM } from '@mikro-orm/core'

class Migrator {
    constructor(private orm: MikroORM, public entitiesMeta: any[]) {}

    async init() {
        if (this.orm.config.get('type') === 'mongo') {
            return
        }
        const schemaGenerator = this.orm.getSchemaGenerator()

        await schemaGenerator.ensureDatabase()

        await schemaGenerator.updateSchema(true, true, false, false)
    }

    private getKnexMethodNameFromType(type: string) {
        if (type === 'string') {
            return 'string'
        }
    
        return 'string'
    }

    private async initSql() {
        const dbName = this.orm.config.get('dbName') as string
        const knex: Knex = (this.orm.em.getConnection() as any).getKnex()

        const databaseSchema = await this.getSchemaFromMysql(dbName, knex)

        await knex.transaction(async trx => {
            for (let index = 0; index < this.entitiesMeta.length; index++) {
                const entityMeta = this.entitiesMeta[index]

                const tableExists = !!databaseSchema[entityMeta.tableName]

                await trx.schema[tableExists ? 'alterTable' : 'createTable'](entityMeta.tableName, (table) => {
                    Object.keys(entityMeta.properties).forEach(propertyName => {
                        const field = entityMeta.properties[propertyName]
                        const columnExists = databaseSchema[entityMeta.tableName]

                        // @ts-ignore
                        let method: ColumnBuilder = table[this.getKnexMethodNameFromType(field.type)]()

                        if (field.primary) {
                            table.increments()
                        }

                        if (columnExists) {
                            
                        }
                    })
                })
            }
        })
    }

    private async getSchemaFromMysql(dbName: string, knex: Knex) {
        const [tables, statistics, columns] = await Promise.all([
            await knex('information_schema.tables').where(
                'table_schema',
                dbName
            ),
            await knex('information_schema.statistics').where(
                'table_schema',
                dbName
            ),
            await knex('information_schema.columns').where(
                'table_schema',
                dbName
            )
        ])

        const tableNames = tables.map(table => table.TABLE_NAME)

        let databaseSchema: {
            [key: string]: {
                table: string,
                columns: string[],
                uniqueColumns: string[],
                nullableColumns: string[],
                searchableColumns: string[],
            }
        } = {}

        tableNames.forEach(tableName => {
            const tableColumns = columns
                .filter(column => column.TABLE_NAME === tableName)

            const tableSchema = {
                table: tableName as string,
                columns: tableColumns.map(column => column.COLUMN_NAME) as string[],
                nullableColumns: tableColumns.filter(column => column.IS_NULLABLE === 'YES').map(column => column.COLUMN_NAME) as string[],
                uniqueColumns: tableColumns.filter(column => column.COLUMN_KEY === 'UNI').map(column => column.COLUMN_NAME) as string[],
                searchableColumns: statistics
                    .filter(statistic => statistic.TABLE_NAME === tableName && statistic.NON_UNIQUE === 1)
                    .map(column => column.COLUMN_NAME) as string[],
            }

            databaseSchema[tableName] = tableSchema
        })

        return databaseSchema
    }
}

export default Migrator
