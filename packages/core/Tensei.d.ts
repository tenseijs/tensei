declare module '@tensei/core' {
    import { SupportedDrivers } from '@tensei/mail'
    import Express, { Application, Request } from 'express'
    import {
        PluginContract,
        ResourceContract,
        SetupFunctions,
        ManagerContract,
        SupportedDatabases,
        PluginSetupConfig,
        DashboardContract
    } from '@tensei/common'

    export interface TenseiContract {
        app: Application
        databaseClient: any
        extensions: {
            [key: string]: any
        }
        register(): Promise<this>
        getPluginArguments(): PluginSetupConfig
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        sessionSecret(secret: string): this
        registerDatabase(): Promise<this>
        apiPath(apiPath: string): this
        manager: (request?: Request) => ManagerContract | null
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
    }

    export class Tensei implements TenseiContract {
        app: Application
        databaseClient: any
        extensions: {
            [key: string]: any
        }
        register(): Promise<this>
        getPluginArguments(): PluginSetupConfig
        callPluginHook(hook: SetupFunctions): Promise<this>
        dashboardPath(dashboardPath: string): this
        database(database: SupportedDatabases): this
        databaseUrl(databaseUrl: string): this
        sessionSecret(secret: string): this
        registerDatabase(): Promise<this>
        apiPath(apiPath: string): this
        manager: () => Manager | null
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
        plugins(plugins: PluginContract[]): this
        mail(driverName: SupportedDrivers, mailConfig?: {}): this
    }

    export const tensei: (config?: {}) => TenseiContract

    export * from '@tensei/common'
}
