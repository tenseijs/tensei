import { FieldContract, User } from '@tensei/common'

export interface AuthPluginConfig {
    fields: FieldContract[]
    nameResource: string
    roleResource: string
    permissionResource: string
    passwordResetsResource: string
    apiPath: string
    jwt: {
        expiresIn: string
        secretKey: string
    }
    teams: boolean
    teamFields: FieldContract[]
    twoFactorAuth: boolean
}

export interface UserWithTwoFactorAuth extends User {
    two_factor_secret?: string
    two_factor_enabled?: boolean
}

export type AuthData = { email: string; password: string; name?: string }
