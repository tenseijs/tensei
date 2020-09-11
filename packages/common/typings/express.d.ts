import { Mail } from '@tensei/mail'
import { ManagerContract, ResourceContract } from '@tensei/common'

declare global {
    namespace Express {
        export interface Request {
            manager: (resourceSlugOrResource: string | ResourceContract) => ManagerContract
            resources: {
                [key: string]: ResourceContract
            }
            mailer: Mail
        }
    }
}
