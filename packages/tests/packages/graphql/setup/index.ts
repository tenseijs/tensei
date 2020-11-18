import { tensei } from '@tensei/core'
import { graphql } from '@tensei/graphql'

import { resources, cleanupDatabase } from '../../../helpers'

export * from '../../../helpers'

export const setup = async () => {
    const instance = await tensei()
        .resources(resources)
        .plugins([graphql().plugin()])
        .databaseConfig({
            // type: 'mysql',
            // dbName: process.env.MYSQL_DATABASE || 'mikro_orm_graphql'
            type: 'postgresql',
            dbName: 'mikrotensei',
            user: 'mikrotensei',
            password: 'password'
        })
        .boot()

    await cleanupDatabase(instance)

    return instance
}
