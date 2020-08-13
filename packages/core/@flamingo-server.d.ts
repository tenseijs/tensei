import {
    Asset,
    Resource,
    FlamingoConfig,
    ResourceManager,
    DatabaseRepositoryInterface,
} from '@flamingo/common'

declare global {
    namespace Express {
        export interface Request {
            scripts: Asset[]
            styles: Asset[]
            db: DatabaseRepositoryInterface
            resources: Resource[]
            appConfig: FlamingoConfig
            administratorResource: Resource
            resourceManager: ResourceManager
        }
    }
}
