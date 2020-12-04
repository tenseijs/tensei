import { Mail } from '@tensei/mail'
import { UserEntity } from './src/config'
import { AnyEntity } from '@mikro-orm/core'
import { SessionData } from 'express-session'
import * as Formatter from 'express-response-formatter'

declare global {
    namespace Express {
        export interface Request {
            user: UserEntity
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        user: {
            id: number
        }
    }
}
