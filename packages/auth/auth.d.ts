import * as Formatter from 'express-response-formatter'
import { GraphQLPluginContext, DataPayload } from '@tensei/common'

declare module '@tensei/common' {
  interface GraphQLPluginContext {
    // @ts-ignore
    authUser: DataPayload & import('@tensei/orm').UserModel
    // @ts-ignore
    team: import('@tensei/orm').TeamModel
  }
}

declare global {
  namespace Express {
    export interface Request {
      verifyTwoFactorAuthToken: (token: string | number) => boolean
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user: {
      id: number
    }
  }
}
