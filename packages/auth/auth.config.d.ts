import { AnyEntity } from '@mikro-orm/core'
import { UserEntity } from './src/config'
import { GraphQLPluginContext } from '@tensei/common'

declare module '@tensei/common' {
    interface GraphQLPluginContext {
        user: UserEntity
    }
}
