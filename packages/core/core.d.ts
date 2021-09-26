import { Mail } from '@tensei/mail'
import indicative from 'indicative'
import { ResourceContract, User, Asset } from '@tensei/common'

declare global {
  namespace Express {
    interface Request {
      req: Request
      resources: {
        [key: string]: ResourceContract
      }
      mailer: Mail
      db: import('@tensei/orm').OrmContract
      repositories: import('@tensei/orm').OrmContract
      storage: Config['storage']
      currentCtx: () => Config
      emitter: Config['emitter']
      indicative: typeof indicative
      scripts: Asset[]
      styles: Asset[]
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    adminUser: {
      id: number
    }
  }
}
