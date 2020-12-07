import { SessionConfig } from '../types'
import { EntitySchema } from '@mikro-orm/core'

export default (config: SessionConfig = {}) => ({
    name: config.entityName || 'Session',
    tableName: config.tableName || 'sessions',
    collection: config.tableName || config.collection || 'sessions',
    properties: {
        session_id: {
            type: 'string',
            primary: true,
            columnTypes: ['varchar(255)']
        },
        expires: {
            type: 'date'
        },
        data: {
            type: 'text'
        }
    }
})
