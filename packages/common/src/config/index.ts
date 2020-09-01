import { Request } from 'express'
import { Signale } from 'signale'
import { Plugin } from '../plugins/Plugin'
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
    filters: Array<{
        field: string
        value: string
        operator:
            | 'equals'
            | 'contains'
            | 'not_equals'
            | 'null'
            | 'not_null'
            | 'gt'
            | 'gte'
            | 'lt'
            | 'lte'
            | 'matches'
            | 'in'
            | 'not_in'
    }>
    withRelationships: string[]
}

export interface FetchAllResults<Model = {}> {
    data: Model[]
    total: number
    perPage: number | null
    pageCount: number
    page: number
}

export interface UserRole {
    id: number
    name: string
    slug: string
}

export interface User {
    id: number
    name: string
    email: string
    roles: UserRole[]
    permissions: string[]
}

export type AuthorizeFunction = (request: Request) => boolean | Promise<boolean>

export type HookFunction = (
    payload: DataPayload,
    request: Request
) => DataPayload

export type FieldHookFunction<FieldValueType = any> = (
    payload: DataPayload,
    request: Request
) => FieldValueType

export interface Asset {
    /* This will be the url this asset will be served from. For example, app-plugin.js */
    name: string
    /* This is the absolute path to the file. This will be used to serve the asset. */
    path: string
}

export type SupportedDatabases = 'mysql' | 'pg' | 'sqlite3'

export interface Env {
    port: string | number
    sessionSecret: string
    databaseUrl?: string
    database: SupportedDatabases
}

export interface Config {
    plugin: Plugin[]
    resources: Resource[]
    scripts: Asset[]
    styles: Asset[]
    env: Env
    dashboardPath: string
    apiPath: string
    adminTable: string
    resourcesMap: {
        [key: string]: Resource
    }
    logger: Signale
}

export type Permission =
    | {
          name: string
          slug: string
      }
    | string

export interface DataPayload {
    [key: string]: any
}

export interface ValidationError {
    message: string
    field: string
}
