import { Request } from 'express'
import { Resource } from '../resources/Resource'

enum noPagination {
    true = 'true',
    false = 'false',
}

export interface FetchAllRequestQuery {
    perPage: number
    page: number
    fields: string[]
    search: string
    noPagination: noPagination
    whereQueries: Array<{
        field: string
        value: string
    }>
}

export interface FetchAllResults<Model = {}> {
    data: Model[]
    total: number
    perPage: number | null
    pageCount: number
    page: number
}

export interface User {
    email: string
    password: string
}

export type HookFunction = (
    payload: DataPayload,
    request: Request
) => DataPayload

export interface Asset {
    name: string
    path: string
}

export type SupportedDatabases = 'mysql' | 'pg' | 'sqlite3'

export interface Env {
    port: string | number
    sessionSecret: string
    databaseUrl?: string
    database: SupportedDatabases
}

export interface FlamingoConfig {
    resources: Resource[]
    scripts: Asset[]
    styles: Asset[]
    env: Env
    dashboardPath: string
    apiPath: string
    adminTable: string
}

export interface DataPayload {
    [key: string]: any
}

export interface ValidationError {
    message: string
    field: string
}
