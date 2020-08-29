import { Mail } from '@flamingo/mail'
import { UserWithTwoFactorAuth } from './src/config'
import { FlamingoConfig, ResourceManager } from '@flamingo/common'

declare global {
    namespace Flamingo {
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
