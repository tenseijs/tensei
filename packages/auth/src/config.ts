import { Field } from '@flamingo/common'

export interface AuthToolConfig {
    fields: Field[]
    nameResource: string
    roleResource: string
    permissionResource: string
    passwordResetsResource: string
    apiPath: string
    jwt: {
        expiresIn: string
        secretKey: string
    }
}

export type AuthData = { email: string; password: string; name?: string }
