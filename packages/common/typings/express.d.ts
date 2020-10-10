import { Request } from 'express'
import { Mail } from '@tensei/mail'
import { StorageManager } from '@slynova/flydrive'
import {
    ManagerContract,
    ResourceContract,
    DashboardContract,
    Config
} from '@tensei/common'

declare global {
    namespace Express {
        export interface Request {
            manager: (
                resourceSlugOrResource: string | ResourceContract,
                request?: Request
            ) => ManagerContract
            resources: {
                [key: string]: ResourceContract
            }
            dashboards: {
                [key: string]: DashboardContract
            }
            mailer: Mail
            config: Config
            storage: StorageManager
            originatedFromDashboard: boolean | undefined
        }
    }
}
