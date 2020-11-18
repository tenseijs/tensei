import { tensei, PluginContract, plugin } from '@tensei/core'

import { resources, cleanupDatabase } from '../../../helpers'

export * from '../../../helpers'

export const setup = async (plugins: PluginContract[] = [], reset = true) => {
    const instance = await tensei()
        .resources(resources)
        .plugins(plugins)
        .databaseConfig({
            type: 'mysql',
            dbName: process.env.MYSQL_DATABASE || 'mikrotensei'
        })
        .boot()

    reset && (await cleanupDatabase(instance))

    return instance
}
