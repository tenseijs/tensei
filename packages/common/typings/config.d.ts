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
    interface Config {
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
        abstract establishDatabaseConnection: () => void
        abstract findUserByEmail: (email: string) => Promise<Model | null>
        abstract getAdministratorsCount: () => Promise<number>
        abstract create: (
            ResourceContract: ResourceContract,
            payload: DataPayload,
            relationshipPayload: DataPayload
        ) => Promise<Model>
        abstract update: (
            ResourceContract: ResourceContract,
            id: number | string,
            payload: DataPayload,
            relationshipPayload: DataPayload,
            patch: boolean
        ) => Promise<Model>
        abstract findAll: (
            ResourceContract: ResourceContract,
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findAllByIds: (
            ResourceContract: ResourceContract,
            ids: number[],
            fields?: string[]
        ) => Promise<Model[]>
        abstract findAllBelongingToMany: (
            ResourceContract: ResourceContract,
            relatedResourceContract: ResourceContract,
            ResourceContractId: number | string,
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findOneById: (
            ResourceContract: ResourceContract,
            id: number | string,
            fields?: string[],
            withRelationships?: string[]
        ) => Promise<Model | null>
        abstract findOneByField: (
            ResourceContract: ResourceContract,
            field: string,
            value: string,
            fields?: string[]
        ) => Promise<Model | null>
        abstract findOneByFieldExcludingOne: (
            ResourceContract: ResourceContract,
            field: string,
            value: string,
            excludeId: string | number,
            fields?: string[]
        ) => Promise<Model | null>
        abstract updateManyByIds: (
            ResourceContract: ResourceContract,
            ids: number[],
            valuesToUpdate: {}
        ) => Promise<number>
        abstract updateOneByField: (
            resource: ResourceContract,
            field: string,
            value: any,
            payload: DataPayload = {}
        ) => Promise<any>
        abstract deleteById: (
            ResourceContract: ResourceContract,
            id: number | string
        ) => Promise<any>
        abstract updateManyWhere: (
            ResourceContract: ResourceContract,
            whereClause: {
                [key: string]: string | number
            },
            valuesToUpdate: {}
        ) => Promise<any>
        abstract getAdministratorById: (
            id: string | number
        ) => Promise<User | null>
    }
}
