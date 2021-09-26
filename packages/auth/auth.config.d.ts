import { AnyEntity } from '@mikro-orm/core'
import { GraphQLPluginContext, DataPayload } from '@tensei/common'

declare module '@tensei/common' {
  interface GraphQLPluginContext {
    // @ts-ignore
    authUser: import('@tensei/orm').UserModel & DataPayload
    // @ts-ignore
    team: import('@tensei/orm').TeamModel
  }
}
