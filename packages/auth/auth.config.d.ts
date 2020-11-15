import { AnyEntity } from '@mikro-orm/core'
import { UserWithAuth } from './src/config'
import { GraphQLPluginContext } from '@tensei/common'

declare module '@tensei/common' {
    interface GraphQLPluginContext {
        user: AnyEntity<UserWithAuth>
    }
}
