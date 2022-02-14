import { Logger } from 'pino'
import { Request } from 'express'
import { MailManagerContract } from '@tensei/mail'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import {
  User,
  Asset,
  Config,
  ManagerContract,
  ResourceContract,
  DashboardContract,
  StorageManagerInterface
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
      storage: StorageManagerInterface
      manager: EntityManager
      scripts: Asset[]
      styles: Asset[]
      logger: Logger
      // @ts-ignore
      authUser: import('@tensei/orm').UserModel & DataPayload
      // @ts-ignore
      team: import('@tensei/orm').TeamModel
      originatedFromDashboard: boolean | undefined
      isGraphqlRequest?: boolean
      authenticationError: (message?: string) => unknown
      forbiddenError: (message?: string) => unknown
      validationError: (message?: string) => unknown
      userInputError: (message?: string, properties?: any) => unknown
    }
  }
}
