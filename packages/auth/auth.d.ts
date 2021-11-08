import * as Formatter from 'express-response-formatter'
import { GraphQLPluginContext, DataPayload } from '@tensei/common'

declare module '@tensei/common' {
  interface GraphQLPluginContext {
    // @ts-ignore
    authUser: import('@tensei/orm').UserModel & DataPayload
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
