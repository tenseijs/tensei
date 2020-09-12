declare module '@tensei/common/config' {
    import { Request } from 'express'
    import { PluginContract } from '@tensei/common/plugins'
    import { ResourceContract } from '@tensei/common/resources'
    enum noPagination {
        true = 'true',
        false = 'false',
    }
    interface FetchAllRequestQuery {
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
    interface FetchAllResults<Model = {}> {
        data: Model[]
        total: number
        perPage: number | null
        pageCount: number
        page: number
    }
    interface UserRole {
        id: number
        name: string
        slug: string
    }
    interface User {
        id: number
        name: string
        email: string
        password?: string
        roles: UserRole[]
        permissions: string[]
    }
    type AuthorizeFunction = (request: Request) => boolean | Promise<boolean>
    type HookFunction = (payload: DataPayload, request: Request) => DataPayload
    type FieldHookFunction<FieldValueType = any> = (
        payload: DataPayload,
        request: Request
    ) => FieldValueType
    interface Asset {
        name: string
        path: string
    }
    type SupportedDatabases = 'mysql' | 'pg' | 'sqlite3'
    interface Env {
        port: string | number
        sessionSecret: string
        databaseUrl?: string
        database: SupportedDatabases
    }
    export interface Config {
        plugins: PluginContract[]
        resources: ResourceContract[]
        scripts: Asset[]
        styles: Asset[]
        env: Env
        dashboardPath: string
        apiPath: string
        adminTable: string
        resourcesMap: {
            [key: string]: ResourceContract
        }
    }
    type Permission =
        | {
              name: string
              slug: string
          }
        | string
    interface DataPayload {
        [key: string]: any
    }
    interface ValidationError {
        message: string
        field: string
    }
    abstract class DatabaseRepositoryInterface<Model = any> {
        static databases: string[]
        abstract setup: (config: Config) => Promise<any>
        abstract setResourceModels: (
            resources: ResourceContract[]
        ) => ResourceContract[]
        abstract getFieldFromResource: (
            resource: ResourceContract,
            databaseField: string
        ) => import('@tensei/common').FieldContract | undefined
        abstract setResource: (
            resourceOrSlug: ResourceContract | string
        ) => this
        abstract findResource: (
            resourceSlug: string | ResourceContract
        ) => ResourceContract<{}>
        abstract establishDatabaseConnection: () => void
        abstract create: (
            payload: DataPayload,
            relationshipPayload: DataPayload
        ) => Promise<Model>
        abstract update: (
            id: number | string,
            payload: DataPayload,
            relationshipPayload: DataPayload,
            patch: boolean
        ) => Promise<Model>
        abstract findAll: (
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findAllByIds: (
            ids: number[],
            fields?: string[]
        ) => Promise<Model[]>
        abstract findAllBelongingToMany: (
            relatedResourceContract: ResourceContract,
            ResourceContractId: number | string,
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findOneById: (
            id: number | string,
            fields?: string[],
            withRelationships?: string[]
        ) => Promise<Model | null>
        abstract findOneByField: (
            field: string,
            value: string,
            fields?: string[]
        ) => Promise<Model | null>
        abstract findOneByFieldExcludingOne: (
            field: string,
            value: string,
            excludeId: string | number,
            fields?: string[]
        ) => Promise<Model | null>
        abstract updateManyByIds: (
            ids: number[],
            valuesToUpdate: {}
        ) => Promise<number>
        abstract updateOneByField: (
            field: string,
            value: any,
            payload: DataPayload = {}
        ) => Promise<any>
        abstract deleteById: (id: number | string) => Promise<any>
        abstract updateManyWhere: (
            whereClause: {
                [key: string]: string | number
            },
            valuesToUpdate: {}
        ) => Promise<any>
        abstract findAllCount: (resource: ResourceContract) => Promise<number>
    }

    export class ResourceHelpers {
        resources: ResourceContract[]
        resource: ResourceContract | null
        constructor(resources: ResourceContract[])
        protected getCurrentResource: () => ResourceContract<{}>
        setResource: (resourceOrSlug: ResourceContract | string) => this
        findResource: (
            resourceSlug: string | ResourceContract
        ) => ResourceContract<{}>
        getFieldFromResource: (
            resource: ResourceContract,
            databaseField: string
        ) => import('@tensei/common').FieldContract | undefined
    }
}
