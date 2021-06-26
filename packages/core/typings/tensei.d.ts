declare module '@tensei/core' {
    import { Server } from 'http'
    import { CorsOptions } from 'cors'
    import { Application } from 'express'
    import {
        Config,
        PluginContract,
        ResourceContract,
        PluginSetupFunction,
        DashboardContract,
        DatabaseConfiguration,
        RouteContract,
        GraphQlQueryContract,
        TensieContext,
        EventContract,
        DataPayload
    } from '@tensei/common'

    export interface TenseiContract {
        ctx: Config
        app: Application
        name: (name: string) => this
        start(fn?: (ctx: Config) => any, listen?: boolean): Promise<this>
        boot(boot: PluginSetupFunction): this
        register(register: PluginSetupFunction): this
        listen(): Promise<Server>
        migrate(): Promise<void>
        routes(routes: RouteContract[]): this
        graphQlQueries(routes: GraphQlQueryContract[]): this
        graphQlTypeDefs(defs: TensieContext['graphQlTypeDefs']): this
        db(databaseConfig: DatabaseConfiguration): this
        databaseConfig(databaseConfig: DatabaseConfiguration): this
        events(events: EventContract<DataPayload>[]): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        root(path: string): this
        mailer(driver: string): this
        resources(resources: ResourceContract[]): this
        dashboards(dashboards: DashboardContract[]): this
        plugins(plugins: PluginContract[]): this
    }

    export class Tensei implements TenseiContract {
        ctx: Config
        app: Application
        name: (name: string) => this
        mailer(driver: string): this
        start(fn?: (ctx: Config) => any, listen?: boolean): Promise<this>
        boot(boot: PluginSetupFunction): this
        migrate(): Promise<void>
        register(register: PluginSetupFunction): this
        listen(): Promise<Server>
        routes(routes: RouteContract[]): this
        graphQlQueries(routes: GraphQlQueryContract[]): this
        graphQlTypeDefs(defs: TensieContext['graphQlTypeDefs']): this
        db(databaseConfig: DatabaseConfiguration): this
        databaseConfig(databaseConfig: DatabaseConfiguration): this
        events(events: EventContract<DataPayload>[]): this
        serverUrl(url: string): this
        clientUrl(url: string): this
        root(path: string): this
        resources(resources: ResourceContract[]): this
        dashboards(dashboards: DashboardContract[]): this
        plugins(plugins: PluginContract[]): this
    }

    export const tensei: () => TenseiContract

    export const welcome: () => PluginContract

    export const cors: (baseOptions?: CorsOptions) => PluginContract

    export * from '@tensei/common'
}
