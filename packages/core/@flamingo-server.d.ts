import {
    Resource,
    FlamingoConfig,
    ResourceManager,
    DatabaseRepositoryInterface,
} from '@flamingo/common'

declare global {
    namespace Express {
        export interface Request {
            scripts: Array<any>
            styles: Array<any>
            db: DatabaseRepositoryInterface
            resources: Resource[]
            appConfig: FlamingoConfig
            administratorResource: Resource
            resourceManager: ResourceManager
        }
    }
}
