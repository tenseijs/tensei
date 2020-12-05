declare module '@tensei/core' {
    import { DocumentNode } from 'graphql'
    import { SupportedDrivers } from '@tensei/mail'
    import { ConnectionOptions } from '@mikro-orm/core'
    import { StorageManager, Storage } from '@slynova/flydrive'
    import Express, { Application, Request } from 'express'
    import {
        Config,
        PluginContract,
        SetupFunctions,
        ManagerContract,
        ResourceContract,
        PluginSetupConfig,
        DashboardContract,
        StorageConstructor,
        SupportedDatabases,
        SupportedStorageDrivers,
        DatabaseConfiguration,
        RouteContract,
        GraphQlQueryContract,
        TensieContext
    } from '@tensei/common'

    export interface TenseiContract {
        app: Application
        getDatabaseClient(): any
        extensions: {
            [key: string]: any
        }
        ctx: Config
        start(fn?: (ctx: Config) => any): Promise<this>
        boot(): Promise<this>
        routes(routes: RouteContract[]): this
        graphQlTypeDefs(typeDefs: (string | DocumentNode)[]): this
        graphQlQueries(queries: GraphQlQueryContract[]): this
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        registerDatabase(): Promise<this>
        db(databaseConfig: DatabaseConfiguration): this
        apiPath(apiPath: string): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        registerMiddleware(): void
        registerCoreRoutes(): void
        registerAssetsRoutes(): void
        resources(resources: ResourceContract[]): this
        dashboards(dashboards: DashboardContract[]): this
        plugins(plugins: PluginContract[]): this
    }

    export class Tensei implements TenseiContract {
        app: Application
        getDatabaseClient: () => any
        extensions: {
            [key: string]: any
        }
        ctx: TensieContext
        routes(routes: RouteContract[]): this
        graphQlQueries(queries: GraphQlQueryContract[]): this
        graphQlTypeDefs(graphQlTypeDefs: TensieContext['graphQlTypeDefs']): this
        storage: StorageManager
        start(fn?: (ctx: Config) => any): Promise<this>
        boot(): Promise<this>
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        databaseUrl(databaseUrl: string): this
        sessionSecret(secret: string): this
        registerDatabase(): Promise<this>
        apiPath(apiPath: string): this
        db(databaseConfig: DatabaseConfiguration): this
        dashboards(dashboards: DashboardContract[]): this
        registerMiddleware(): void
        serverUrl(url: string): this
        clientUrl(url: string): this
        authMiddleware: (
            request: Express.Request,
            response: Express.Response,
            next: Express.NextFunction
        ) => Promise<Express.Response<any> | undefined>
        setAuthMiddleware: (
            request: Express.Request,
            response: Express.Response,
            next: Express.NextFunction
        ) => Promise<void | Express.Response<any>>
        registerCoreRoutes(): void
        registerAssetsRoutes(): void
        resources(resources: ResourceContract[]): this
        plugins(plugins: PluginContract[]): this
        defaultStorageDriver(driverName: string): this
    }

    export const tensei: (config?: {}) => TenseiContract

    export * from '@tensei/common'
}
