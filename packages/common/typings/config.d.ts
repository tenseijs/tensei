declare module '@tensei/common/config' {
    import { Storage } from '@slynova/flydrive'
    import { sanitizer, validator } from 'indicative'
    import { ResourceContract } from '@tensei/common/resources'
    import { DashboardContract } from '@tensei/common/dashboards'
    import { PluginContract, PluginSetupConfig } from '@tensei/common/plugins'
    import {
        Request,
        Handler,
        NextFunction,
        ErrorRequestHandler,
        RequestHandler
    } from 'express'

    enum noPagination {
        true = 'true',
        false = 'false'
    }
    interface Filter {
        field: string
        value: string
        operator:
            | 'equals'
            | 'contains'
            | 'not_equals'
            | 'is_null'
            | 'not_null'
            | 'gt'
            | 'gte'
            | 'lt'
            | 'lte'
            | 'matches'
            | 'in'
            | 'not_in'
    }
    interface FetchAllRequestQuery {
        perPage?: number
        per_page?: number
        page?: number
        fields?: string[]
        search?: string
        filters?: Filter[]
        withRelationships?: string[]
        noPagination?: 'true' | 'false'
    }
    interface StorageConstructor<T extends Storage = Storage> {
        new (...args: any[]): T
    }

    type SupportedStorageDrivers = 'local' | 's3' | any

    interface FetchAllResults<Model = any> {
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
    type AuthorizeFunction<ModelType = any> = (
        request: Request,
        models?: ModelType[],
    ) => boolean | Promise<boolean>
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
        databaseClient: any
        serverUrl: string
        clientUrl: string
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

        indicative: {
            validator: typeof validator
            sanitizer: typeof sanitizer
        }

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
        abstract getAdministratorById: (id: string | number) => Promise<Model>
        abstract createAdministrator: (payload: DataPayload) => Promise<Model>
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
            ids: string[],
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
            withRelationships?: string[],
            withHidden?: boolean
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
        abstract findAllCount: (
            baseQuery?: FetchAllRequestQuery
        ) => Promise<number>
        abstract findAllBelongingToMany: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<{
            page: number
            perPage: number
            total: number
            data: any
            pageCount: number
        }>
        abstract findAllBelongingToManyData: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<any>
        abstract findAllBelongingToManyCount: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<any>
        abstract findAllBelongingToManyResolvers: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<(() => any)[]>

        abstract findAllHasMany: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<{
            page: number
            perPage: number
            total: number
            data: any
            pageCount: number
        }>
        abstract findAllHasManyData: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<any>
        abstract findAllHasManyCount: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<any>
        abstract findAllHasManyResolvers: (
            relatedResource: ResourceContract,
            resourceId: string | number,
            baseQuery: FetchAllRequestQuery
        ) => Promise<(() => any)[]>

        abstract findAllData: (baseQuery: FetchAllRequestQuery) => Promise<any>
        abstract findAll: (
            baseQuery: FetchAllRequestQuery
        ) => Promise<{
            data: any
            page: number
            total: number
            perPage: number
            pageCount: number
        }>
        abstract findAllResolvers: (
            baseQuery: FetchAllRequestQuery
        ) => (() => any)[]
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
