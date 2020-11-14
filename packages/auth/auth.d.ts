import { Mail } from '@tensei/mail'
import { UserWithAuth } from './src/config'
import { AnyEntity } from '@mikro-orm/core'

declare global {
    namespace Express {
        export interface Request {
            user?: AnyEntity<any>
        }
    }
}
