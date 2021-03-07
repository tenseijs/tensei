import { HookFunction, FieldContract, ResourceContract } from '@tensei/common'
import { CookieOptions } from 'express'
import { AnyEntity } from '@mikro-orm/core'
import { UserRole } from '@tensei/common'
import { ApiContext } from '@tensei/common'
import { DataPayload } from '@tensei/common'

export interface GrantConfig {
    key: string
    secret: string
    scope?: string[]
    callback?: string
    redirect_uri?: string
    clientCallback?: string
}

export type SupportedSocialProviders =
    | 'github'
    | 'gitlab'
    | 'google'
    | 'facebook'
    | 'twitter'
    | 'linkedin'

export type AuthResources = {
    user: ResourceContract
    role: ResourceContract
    oauthIdentity: ResourceContract
    permission: ResourceContract
    passwordReset: ResourceContract
    token: ResourceContract
}

export enum TokenTypes {
    REFRESH = 'REFRESH',
    PASSWORDLESS = 'PASSWORDLESS'
}

export type AuthHookFunction<Payload = DataPayload> = (
    ctx: ApiContext,
    payload: Payload
) => void | Promise<any>

export interface AuthPluginConfig {
    fields: FieldContract[]
    userResource: string
    tokenResource: string
    prefix: string
    enableRefreshTokens?: boolean
    registered?: (ctx: ApiContext) => Promise<void> | void
    roleResource: string
    permissionResource: string
    rolesAndPermissions: boolean
    passwordResetResource: string
    apiPath: string
    tokensConfig: {
        secretKey: string
        accessTokenExpiresIn: number
        refreshTokenExpiresIn: number
    }
    httpOnlyCookiesAuth?: boolean
    getUserPayloadFromProviderData?: (providerData: DataPayload) => DataPayload
    separateSocialLoginAndRegister: boolean
    beforeLogin: AuthHookFunction
    afterLogin: AuthHookFunction
    beforeRegister: AuthHookFunction<{
        roles: string[]
        email: string
        password: string
        email_verified_at?: string
        email_verification_token?: string | null

        [key: string]: any
    }>
    afterRegister: AuthHookFunction<UserEntity>
    beforePasswordReset: AuthHookFunction
    afterPasswordReset: AuthHookFunction
    refreshTokenHeaderName: string
    cookieOptions: Omit<CookieOptions, 'httpOnly' | 'maxAge'>
    verifyEmails?: boolean
    skipWelcomeEmail?: boolean
    twoFactorAuth: boolean
    providers: {
        [key: string]: GrantConfig
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

export const USER_EVENTS = {
    REGISTERED: 'user::registered',
    LOGGED_IN: 'user::logged::in',
    ADMIN_REGISTERED: 'admin::registered',
    FORGOT_PASSWORD: 'user::forgot::password',
    RESET_PASSWORD: 'user::reset::password',
    VERIFIED_EMAIL: 'user::verified::email',
    RESENT_VERIFICATION_EMAIL: 'user::reset::verification::email'
}
