import { Mail } from '@tensei/mail'
import { UserEntity } from './src/config'
import { AnyEntity } from '@mikro-orm/core'
import * as Formatter from 'express-response-formatter'
declare global {
    namespace Express {
        export interface Request {
            user: UserEntity
        }
    }
}
