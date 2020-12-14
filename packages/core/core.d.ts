import { Signale } from 'signale'
import { Mail } from '@tensei/mail'
import { ResourceContract, User, Config, Asset } from '@tensei/common'

declare module '@tensei/common' {
    interface Config {
        logger: Signale
    }
}

declare global {
    namespace Express {
        interface Request {
            req: Request
            resources: {
                [key: string]: ResourceContract
            }
            mailer: Mail
            storage: Config['storage']
            currentCtx: () => Config
            scripts: Asset[]
            styles: Asset[]
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        admin_user: {
            id: number
        }
    }
}
