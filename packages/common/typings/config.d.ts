declare module '@tensei/common/config' {
    import { Signale } from 'signale'
    import { Mail } from '@tensei/mail'
    import { Request, Response } from 'express'
    import { EntityManager } from '@mikro-orm/core'
    import { IMiddleware } from 'graphql-middleware'
    import { sanitizer, validator } from 'indicative'
    import { ResourceContract } from '@tensei/common/resources'
    import { ExecutionParams } from 'subscriptions-transport-ws'
    import { DashboardContract } from '@tensei/common/dashboards'
    import { IResolvers, ITypedef, PubSub } from 'apollo-server-express'
    import { DocumentNode, GraphQLSchema, GraphQLResolveInfo } from 'graphql'
    import { PluginContract, PluginSetupConfig } from '@tensei/common/plugins'
    import {
        MikroORM,
        ConnectionOptions,
        EventArgs,
        FlushEventArgs,
        MikroORMOptions
    } from '@mikro-orm/core'
    import {
        Storage,
        StorageManager,
        StorageManagerConfig
    } from '@slynova/flydrive'
    import {
        Request,
        Handler,
        NextFunction,
        ErrorRequestHandler,
        RequestHandler
    } from 'express'

    type EndpointTypes = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

    interface RouteExtendContract extends Record<string, any> {}

    interface RouteContract {
        config: RouteConfig & {
            extend: RouteExtendContract
        }
        path(path: string): this
        get(): this
        cms(): this
        post(): this
        put(): this
        patch(): this
        delete(): this
        internal(): this
        extend(extend: RouteExtendContract): this
        resource(resource: ResourceContract): this
        middleware(middleware: RequestHandler[]): this
        resource(resource: ResourceContract): this
        authorize(authorize: AuthorizeFunction): this
        handle(handler: RouteConfig['handler']): this
    }

    interface UtilsContract {
        validator: (
            resource: ResourceContract,
            manager: EntityManager,
            resourcesMap: {
                [key: string]: ResourceContract
            },
            modelId?: string | number | undefined
        ) => {
            getValidationRules: (
                creationRules?: boolean
            ) => {
                [key: string]: string
            }
            validate: (
                payload: DataPayload,
                creationRules?: boolean,
                modelId?: string | number | undefined
            ) => Promise<[boolean, DataPayload | array[any]]>
        }
    }

    interface GraphQlQueryContract {
        config: GraphQlQueryConfig
        path(path: string): this
        query(): this
        mutation(): this
        internal(): this
        subscription(): this
        resource(resource: ResourceContract): this
        authorize(authorize: AuthorizeFunction): this
        filter(filter: GraphQlQueryConfig['filter']): this
        handle(handler: GraphQlQueryConfig['handler']): this
        middleware(middleware: GraphQlQueryConfig['handler'][]): this
    }

    interface RouteConfig {
        path: string
        name: string
        cms: boolean
        internal: boolean
        type: EndpointTypes
        snakeCaseName: string
        paramCaseName: string
        resource?: ResourceContract
        middleware: RequestHandler[]
        authorize: AuthorizeFunction[]
        handler: (request: Request, response: Response) => any | Promise<any>
    }

    interface GraphQlQueryConfig<
        TSource = any,
        TArgs = DataPayload,
        TContext = ApiContext
    > {
        path: string
        name: string
        middleware: GraphQlQueryConfig['handler'][]
        internal: boolean
        snakeCaseName: string
        paramCaseName: string
        resource?: ResourceContract
        type: 'QUERY' | 'MUTATION' | 'SUBSCRIPTION'
        authorize: AuthorizeFunction[]
        handler: (
            source: TSource,
            args: TArgs,
            context: TContext,
            info: GraphQLResolveInfo
        ) => any | Promise<any>
        filter: (
            payload: DataPayload,
            args: {
                filter: TArgs
            }
        ) => boolean | Promise<boolean>
    }
    interface GraphQLPluginExtension {
        typeDefs: string | DocumentNode
        resolvers: IResolvers
    }

    interface GraphQLPluginContext extends TensieContext {
        req: Request
        res: Response
        pubsub: PubSub
        connection?: ExecutionParams
        authenticationError: (message?: string) => unknown
        forbiddenError: (message?: string) => unknown
        validationError: (message?: string) => unknown
        userInputError: (message?: string, properties?: any) => unknown
    }

    interface ApiContext extends GraphQLPluginContext {}

    enum noPagination {
        true = 'true',
        false = 'false'
    }
    type FilterOperators =
        | '_and'
        | '_or'
        | '_eq'
        | '_ne'
        | '_in'
        | '_nin'
        | '_not'
        | '_gt'
        | '_gte'
        | '_lt'
        | '_lte'
        | '_like'
        | '_re'
        | '_ilike'
        | '_overlap'
        | '_contains'
        | '_contained'
    interface Filter {
        field: string
        value: string
        operator: FilterOperators
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
        permissions: {
            id: number
            name: string
            slug: string
        }[]
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
        ctx: GraphQLPluginContext
    ) => boolean | Promise<boolean>
    type HookFunction<EntityType = DataPayload> = (
        payload: EventArgs<EntityType>
    ) => void
    type FlushHookFunction<EntityType = DataPayload> = (
        payload: FlushEventArgs
    ) => Promise<void>
    type HookFunctionPromised<EntityType = DataPayload> = (
        payload: EventArgs<EntityType>
    ) => Promise<void>
    type FieldHookFunction<FieldValueType = any> = (
        payload: DataPayload,
        request: Request
    ) => FieldValueType
    interface Asset {
        name: string
        path: string
    }
    type SupportedDatabases =
        | 'mongo'
        | 'mysql'
        | 'mariadb'
        | 'postgresql'
        | 'sqlite'
    type InBuiltEndpoints =
        | 'show'
        | 'index'
        | 'create'
        | 'update'
        | 'delete'
        | 'runAction'
        | 'showRelation'
    type ExpressMiddleware = ErrorRequestHandler | RequestHandler
    interface EndpointMiddleware {
        type: InBuiltEndpoints
        handler: ExpressMiddleware
    }
    type DatabaseConfiguration = Partial<
        MikroORMOptions & {
            type: SupportedDatabases
        }
    >
    type AdditionalEntities = {
        entities?: any[]
    }
    type Resolvers<TSource = any, TContext = GraphQLPluginContext> = IResolvers<
        TSource,
        TContext
    >
    type GraphQlMiddleware<
        TSource = any,
        TContext = GraphQLPluginContext,
        TArgs = any
    > = IMiddleware<TSource, TContext, TArgs>
    type MiddlewareGenerator<
        TSource = any,
        TContext = GraphQLPluginContext,
        TArgs = any
    > = (
        graphQlQueries: GraphQlQueryContract[],
        typeDefs: ITypedef[],
        schema: GraphQLSchema
    ) => IMiddleware<TSource, TContext, TArgs>
    export interface Config {
        databaseClient: any
        schemas: any
        serverUrl: string
        clientUrl: string
        mailer: Mail
        storage: StorageManager
        storageConfig: StorageManagerConfig
        routes: RouteContract[]
        graphQlTypeDefs: (string | DocumentNode)[]
        graphQlQueries: GraphQlQueryContract[]
        graphQlMiddleware: MiddlewareGenerator[]
        extendGraphQlMiddleware(
            middlewareGenerators: MiddlewareGenerator[]
        ): void
        plugins: PluginContract[]
        dashboards: DashboardContract[]
        resources: ResourceContract[]
        scripts: Asset[]
        styles: Asset[]
        orm: MikroORM | null
        logger: Signale
        databaseConfig: DatabaseConfiguration & AdditionalEntities
        dashboardPath: string
        apiPath: string
        adminTable: string
        resourcesMap: {
            [key: string]: ResourceContract
        }
        dashboardsMap: {
            [key: string]: DashboardContract
        }
        extendResources: PluginSetupConfig['extendResources']

        indicative: {
            validator: typeof validator
            sanitizer: typeof sanitizer
        }

        middleware: EndpointMiddleware[]

        graphQlExtensions: GraphQLPluginExtension[]
    }
    export interface TensieContext extends Config {
        manager: EntityManager
        body: DataPayload
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
    const graphQlQuery: (name?: string) => GraphQlQueryContract
    const route: (name?: string) => RouteContract
    const Utils: UtilsContract
}
