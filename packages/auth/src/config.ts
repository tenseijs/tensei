import { FieldContract, User, HookFunction } from '@tensei/common'

export interface GrantConfig {
    key: string
    secret: string
    scope?: string[]
    callback?: string
    redirect_uri?: string
    clientCallback: string
}

export type SupportedSocialProviders =
    | 'github'
    | 'gitlab'
    | 'google'
    | 'facebook'
    | 'twitter'

export interface AuthPluginConfig {
    fields: FieldContract[]
    nameResource: string
    roleResource: string
    permissionResource: string
    rolesAndPermissions: boolean
    passwordResetsResource: string
    apiPath: string
    jwt: {
        expiresIn: string
        secretKey: string
    }
    teams: boolean
    verifyEmails?: boolean
    skipWelcomeEmail?: boolean
    teamFields: FieldContract[]
    twoFactorAuth: boolean
    beforeCreateUser?: HookFunction
    afterCreateUser?: HookFunction
    beforeUpdateUser?: HookFunction
    afterUpdateUser?: HookFunction
    beforeLoginUser?: HookFunction
    afterLoginUser?: HookFunction
    providers: {
        [key: string]: GrantConfig
    }
}

export interface UserWithAuth extends User {
    two_factor_secret?: string
    two_factor_enabled?: boolean

    email_verified_at?: string
    email_verification_token?: string
}

export type AuthData = { email: string; password: string; name?: string }
