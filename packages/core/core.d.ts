import { Signale } from 'signale'
import { Mail } from '@tensei/mail'
import { ResourceContract, User, Config, Asset, ManagerContract } from '@tensei/common'

declare module '@tensei/common' {
    interface Config {
        logger: Signale
    }
}

declare global {
    namespace Express {
        interface Request {
            resources: {
                [key: string]: ResourceContract
            }
            administratorResource: ResourceContract,
            Mailer: Mail
            admin?: User
            appConfig: Config
            scripts: Asset[]
            styles: Asset[]
        }
    }
}
