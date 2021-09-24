import { Logger } from 'pino'
import { Request } from 'express'
import { MailManagerContract } from '@tensei/mail'
import { StorageManager } from '@slynova/flydrive'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import {
  User,
  Asset,
  Config,
  ManagerContract,
  ResourceContract,
  DashboardContract
} from '@tensei/common'

declare global {
  namespace Express {
    export interface Request {
      resources: {
        [key: string]: ResourceContract
      }
      dashboards: {
        [key: string]: DashboardContract
      }
      mailer: MailManagerContract
      config: Config
      orm: MikroORM
      db: import('@tensei/orm').OrmContract
      repositories: import('@tensei/orm').OrmContract
      storage: StorageManager
      manager: EntityManager
      scripts: Asset[]
      styles: Asset[]
      logger: Logger
      // @ts-ignore
      user: import('@tensei/orm').UserModel & DataPayload
      // @ts-ignore
      team: import('@tensei/orm').TeamModel
      originatedFromDashboard: boolean | undefined
      authenticationError: (message?: string) => unknown
      forbiddenError: (message?: string) => unknown
      validationError: (message?: string) => unknown
      userInputError: (message?: string, properties?: any) => unknown
    }
  }
}
