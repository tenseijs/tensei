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
        storage: StorageManager
        start(fn?: (ctx: Config) => any): Promise<this>
        boot(): Promise<this>
        routes(routes: RouteContract[]): this
        graphQlTypeDefs(typeDefs: (string | DocumentNode)[]): this
        graphQlQueries(queries: GraphQlQueryContract[]): this
        getPluginArguments(): PluginSetupConfig
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        registerDatabase(): Promise<this>
        db(databaseConfig: DatabaseConfiguration): this
        apiPath(apiPath: string): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        registerMiddleware(): void
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
        asyncHandler(
            handler: Express.Handler
        ): Express.RequestHandler<
            import('express-serve-static-core').ParamsDictionary,
            any,
            any,
            import('qs').ParsedQs
        >
        resources(resources: ResourceContract[]): this
        dashboards(dashboards: DashboardContract[]): this
        plugins(plugins: PluginContract[]): this
        mail(driverName: SupportedDrivers, mailConfig?: {}): this
        storageDriver<
            StorageDriverImplementation extends Storage,
            DriverConfig extends unknown
        >(
            driverName: SupportedStorageDrivers,
            driverConfig: DriverConfig,
            storageImplementation: StorageConstructor<
                StorageDriverImplementation
            >
        ): this
        defaultStorageDriver(driverName: string): this
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
        storage: StorageManager
        start(fn?: (ctx: Config) => any): Promise<this>
        boot(): Promise<this>
        getPluginArguments(): PluginSetupConfig
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
        asyncHandler(
            handler: Express.Handler
        ): Express.RequestHandler<
            import('express-serve-static-core').ParamsDictionary,
            any,
            any,
            import('qs').ParsedQs
        >
        resources(resources: ResourceContract[]): this
        plugins(plugins: PluginContract[]): this
        mail(driverName: SupportedDrivers, mailConfig?: {}): this
        storageDriver<
            StorageDriverImplementation extends Storage,
            DriverConfig extends unknown
        >(
            driverName: SupportedStorageDrivers,
            driverConfig: DriverConfig,
            storageImplementation: StorageConstructor<
                StorageDriverImplementation
            >
        ): this
        defaultStorageDriver(driverName: string): this
    }

    export const tensei: (config?: {}) => TenseiContract

    export * from '@tensei/common'
}
