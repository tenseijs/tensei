import { tensei, TenseiContract } from '@tensei/core'
import { MongoDriver } from '@mikro-orm/mongodb'
import { EntityManager } from '@mikro-orm/core'
import { graphql } from '@tensei/graphql'

import { resources } from '../../../helpers'

export * from '../../../helpers'

export const setup = async () => {

    const instance = await tensei()
        .resources(resources)
        .plugins([
            graphql()
                .plugin()
        ])
        .databaseConfig({
            type: 'mysql',
            dbName: process.env.MYSQL_DATABASE || 'mikro_orm_graphql',
        })
        .register()

    await cleanupDatabase(instance)

    return instance
}

export const cleanupDatabase = async (instance: TenseiContract) => {
    const type = instance.ctx.orm.config.get('type')

    if (type === 'mongo') {
        return cleanupMongodbDatabase(instance)
    }

    const schemaGenerator = instance.ctx.orm.getSchemaGenerator()

    await schemaGenerator.dropSchema()

    await schemaGenerator.createSchema()
}

export const cleanupMongodbDatabase = async (instance: TenseiContract) => {
    await (instance.ctx.orm.em.getDriver() as unknown as EntityManager<MongoDriver>).getConnection().getDb().dropDatabase()
}


export const sortArrayById = (items: any[]) => items.sort((i1: any, i2: any) => i1.id > i2.id ? 1 : -1)
