import { Mail } from '@tensei/mail'
import { UserWithAuth } from './src/config'

declare global {
    namespace Express {
        export interface Request {
            authUser?: UserWithAuth
        }
    }
}
