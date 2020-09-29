declare module '@tensei/common/config' {
    import { ResourceContract } from '@tensei/common/resources'
    import { DashboardContract } from '@tensei/common/dashboards'
    import { PluginContract, PluginSetupConfig } from '@tensei/common/plugins'
    import {
        Request,
        Handler,
        NextFunction,
        ErrorRequestHandler,
        RequestHandler,
    } from 'express'

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
    type HookFunction = (
        payload: DataPayload,
        request: Request | null
    ) => DataPayload
    type FieldHookFunction<FieldValueType = any> = (
        payload: DataPayload,
        request: Request
    ) => FieldValueType
    interface Asset {
        name: string
        path: string
    }
    type SupportedDatabases = 'mysql' | 'pg' | 'sqlite' | 'mongodb'
    type InBuiltEndpoints =
        | 'show'
        | 'index'
        | 'create'
        | 'update'
        | 'delete'
        | 'runAction'
        | 'showRelation'
    type ExpressMiddleware = ErrorRequestHandler | RequestHandler
    interface Env {
        port: string | number
        sessionSecret: string
    }
    interface EndpointMiddleware {
        type: InBuiltEndpoints
        handler: ExpressMiddleware
    }
    export interface Config {
        plugins: PluginContract[]
        dashboards: DashboardContract[]
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
        dashboardsMap: {
            [key: string]: DashboardContract
        }
        database: SupportedDatabases
        pushResource: PluginSetupConfig['pushResource']

        showController: Handler
        indexController: Handler
        createController: Handler
        updateController: Handler
        deleteController: Handler
        runActionController: Handler
        showRelationController: Handler

        middleware: EndpointMiddleware[]
        pushMiddleware: (middleware: EndpointMiddleware) => void
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
        abstract aggregateCount: (between: [string, string]) => Promise<number>
        abstract aggregateAvg: (
            between: [string, string],
            columns: string[]
        ) => Promise<number>
        abstract aggregateMax: (
            between: [string, string],
            columns: string[]
        ) => Promise<number>
        abstract aggregateMin: (
            between: [string, string],
            columns: string[]
        ) => Promise<number>
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
            relationshipPayload?: DataPayload
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
        abstract findAllCount: () => Promise<number>
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
