import {
    User,
    HookFunction,
    FieldContract,
    ResourceContract
} from '@tensei/common'
import { CookieOptions } from 'express'
import { AnyEntity } from '@mikro-orm/core'
import { UserRole } from '@tensei/common'

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
    userResource: string
    roleResource: string
    permissionResource: string
    rolesAndPermissions: boolean
    passwordResetResource: string
    apiPath: string
    jwt: {
        expiresIn: number
        secretKey: string
        refreshTokenExpiresIn: number
    }
    refresTokenCookieName: string
    teams: boolean
    cookieOptions: Omit<CookieOptions, 'httpOnly' | 'maxAge'>
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

export interface UserEntity extends AnyEntity {
    id: number
    name: string
    email: string
    password?: string
    roles: UserRole[]
    permissions: string[]

    public: boolean
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
