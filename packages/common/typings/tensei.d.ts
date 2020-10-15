declare module '@tensei/core' {
    import { SupportedDrivers } from '@tensei/mail'
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
        SupportedStorageDrivers
    } from '@tensei/common'

    export interface TenseiContract {
        app: Application
        getDatabaseClient(): any
        extensions: {
            [key: string]: any
        }
        config: Config
        storage: StorageManager
        register(): Promise<this>
        getPluginArguments(): PluginSetupConfig
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        sessionSecret(secret: string): this
        registerDatabase(): Promise<this>
        apiPath(apiPath: string): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        manager: (request: Request) => ManagerContract['setResource'] | null
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
        database(database: SupportedDatabases): this
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
        config: Config
        storage: StorageManager
        register(): Promise<this>
        getPluginArguments(): PluginSetupConfig
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        database(database: SupportedDatabases): this
        databaseUrl(databaseUrl: string): this
        sessionSecret(secret: string): this
        registerDatabase(): Promise<this>
        apiPath(apiPath: string): this
        manager: () => ManagerContract['setResource'] | null
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
