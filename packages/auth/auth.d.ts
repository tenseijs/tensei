import { Mail } from '@tensei/mail'
import { UserWithTwoFactorAuth } from './src/config'
import { Config, ResourceManager } from '@tensei/common'

declare global {
    namespace Tensei {
        export interface User {
            two_factor_secret?: string
        }
    }
}

declare global {
    namespace Express {
        export interface Request {
            authUser?: UserWithTwoFactorAuth
        }
    }
}
