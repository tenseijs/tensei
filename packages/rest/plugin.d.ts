import { AnyEntity } from '@mikro-orm/core'

declare global {
    namespace Express {
        export interface Request {
            entity: AnyEntity
        }
    }
}
