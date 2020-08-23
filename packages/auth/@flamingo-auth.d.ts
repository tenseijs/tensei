import { Mail } from '@flamingo/mail'
import { FlamingoConfig, ResourceManager } from '@flamingo/common'

declare global {
    namespace Express {
        export interface Request {
            Mailer: Mail
            resourceManager: ResourceManager
            resources: FlamingoConfig['resourcesMap']
        }
    }
}
