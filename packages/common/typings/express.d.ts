import { Mail } from '@tensei/mail'
import { ManagerContract, ResourceContract } from '@tensei/common'

declare global {
    namespace Express {
        export interface Request {
            manager: ManagerContract
            resources: {
                [key: string]: ResourceContract
            }
            Mailer: Mail
        }
    }
}
