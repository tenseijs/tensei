import { PluginSetupFunction } from '@tensei/common'

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
        ctx: Config
        app: Application
        start(fn?: (ctx: Config) => any, listen?: boolean): Promise<this>
        boot(boot: PluginSetupFunction): this
        register(register: PluginSetupFunction): this
        listen(): void
        routes(routes: RouteContract[]): this
        db(databaseConfig: DatabaseConfiguration): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        resources(resources: ResourceContract[]): this
        dashboards(dashboards: DashboardContract[]): this
        plugins(plugins: PluginContract[]): this
    }

    export class Tensei implements TenseiContract {
        ctx: Config
        app: Application
        start(fn?: (ctx: Config) => any, listen?: boolean): Promise<this>
        boot(boot: PluginSetupFunction): this
        register(register: PluginSetupFunction): this
        listen(): void
        routes(routes: RouteContract[]): this
        db(databaseConfig: DatabaseConfiguration): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        resources(resources: ResourceContract[]): this
        dashboards(dashboards: DashboardContract[]): this
        plugins(plugins: PluginContract[]): this
    }

    export const tensei: () => TenseiContract

    export * from '@tensei/common'
}
