import {
    FieldContract,
    User,
    HookFunction,
    ResourceContract
} from '@tensei/common'

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
    | 'linkedin'

export interface AuthPluginConfig {
    fields: FieldContract[]
    profilePictures: boolean
    nameResource: string
    roleResource: string
    permissionResource: string
    rolesAndPermissions: boolean
    passwordResetResource: string
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
    beforeOAuthIdentityCreated?: HookFunction
    providers: {
        [key: string]: GrantConfig
    }
    resources: {
        [key: string]: ResourceContract
    }
}

export interface UserWithAuth extends User {
    two_factor_secret?: string
    two_factor_enabled?: boolean

    email_verified_at?: string
    email_verification_token?: string
}

export type AuthData = { email: string; password: string; name?: string }

export const defaultProviderScopes = (
    provider: SupportedSocialProviders
): string[] =>
    ({
        google: ['email'],
        github: ['user', 'user:email'],
        gitlab: [],
        facebook: ['email'],
        twitter: [],
        linkedin: ['r_liteprofile', 'r_emailaddress']
    }[provider])
