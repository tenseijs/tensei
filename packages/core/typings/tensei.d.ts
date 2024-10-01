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
    TenseiContext,
    EventContract,
    DataPayload,
    CommandContract,
    TenseiContract
  } from '@tensei/common'

  export type TENSEI_MODE = 'cli' | 'default' | 'serverless'

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
    graphQlTypeDefs(defs: TenseiContext['graphQlTypeDefs']): this
    db(databaseConfig: DatabaseConfiguration): this
    databaseConfig(databaseConfig: DatabaseConfiguration): this
    events(events: EventContract<DataPayload>[]): this
    commands(command: CommandContract[]): this
    serverUrl(url: string): this
    clientUrl(url: string): this
    root(path: string): this
    storageDriver<DriverConfig extends DefaultStorageDriverConfig>(
      driver: StorageDriverInterface<DriverConfig>
    ): this
    resources(resources: ResourceContract[]): this
    dashboards(dashboards: DashboardContract[]): this
    plugins(plugins: PluginContract[]): this
  }

  export const tensei: () => TenseiContract

  export const welcome: () => PluginContract

  export const cors: (baseOptions?: CorsOptions) => PluginContract

  export * from '@tensei/orm'
  export * from '@tensei/common'
}
