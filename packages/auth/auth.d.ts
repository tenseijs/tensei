import { Mail } from '@tensei/mail'
import { UserWithTwoFactorAuth } from './src/config'

declare global {
    namespace Express {
        export interface Request {
            authUser?: UserWithTwoFactorAuth
        }
    }
}
