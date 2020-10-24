import { Request } from 'express'
import { Mail } from '@tensei/mail'
import { StorageManager } from '@slynova/flydrive'
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
            admin?: User
            scripts: Asset[]
            styles: Asset[]
            originatedFromDashboard: boolean | undefined
        }
    }
}
