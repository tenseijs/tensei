import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

export interface UserPermission {
    id: number
    name: string
    slug: string
}

export interface UserRole {
    id: number
    name: string
    slug: string
    permissions: UserPermission[]
}

export interface User {
    id: number
    name: string
    email: string
    roles: UserRole[]
    permissions: UserPermission[]

    two_factor_enabled?: boolean

    email_verified_at?: string
}

export interface TenseiState {
    admin: User
    ctx: {
        apiPath: string
        dashboardPath: string
    }
    permissions: {
        [key: string]: boolean
    }
    registered: boolean
    resources: ResourceContract[]
}

export interface SerializedTenseiState {
    ctx: string
    admin?: string
    resources: string
    registered: string
}

export interface ResourceContract {
    slug: string
    label: string
    group: string
    pascalCaseName: string
}

export interface Tensei {
    boot: () => void
    state: TenseiState
    getPath: (path: string) => string
    client: ApolloClient<NormalizedCacheObject>
}
