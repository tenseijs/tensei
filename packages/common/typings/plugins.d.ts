declare module '@tensei/common/plugins' {
  import { Application } from 'express'
  import {
    StorageDriverInterface,
    DefaultDriverConfig,
    StorageManagerInterface
  } from '@tensei/common'
  import { DocumentNode } from 'graphql'
  import { Server } from 'http'
  import { CommandContract } from '@tensei/common/commands'
  import { EntityManager } from '@mikro-orm/core'
  import { MailDriverContract, MailConfig } from '@tensei/mail'
  import { ResourceContract, ManagerContract } from '@tensei/common/resources'
  import {
    Asset,
    Config,
    Permission,
    GraphQLPluginExtension,
    RouteContract,
    GraphQlQueryContract,
    TenseiContext,
    RouteConfig,
    EventContract,
    DataPayload
  } from '@tensei/common/config'

  type PluginSetupFunction = (config: PluginSetupConfig) => void | Promise<void>

  type SetupFunctions = 'boot' | 'register'

  interface PluginSetupConfig extends Config {
    resources: ResourceContract[]
    app: Application
    server: Server
    resourcesMap: {
      [key: string]: ResourceContract
    }
    storage: StorageDriverInterface
    manager: EntityManager | null
    setPluginConfig: (name: string, config: any) => void
    gql: (types: string | TemplateStringsArray) => DocumentNode
    style: (name: Asset['name'], path: Asset['path']) => void
    script: (
      name: Asset['name'],
      path: Asset['path'],
      chunk?: Asset['chunk']
    ) => void
    extendGraphQlQueries: (queries: GraphQlQueryContract[]) => any
    extendGraphQlTypeDefs: (typeDefs: (string | DocumentNode)[]) => any
    extendRoutes: (queries: RouteContract[]) => any
    extendCommands: (queries: CommandContract[]) => any
    extendResources: (resources: ResourceContract[]) => any
    currentCtx: () => Config
    getQuery: (path: string) => GraphQlQueryContract | undefined
    getRoute: (id: string) => RouteContract | undefined
    extendMailer: (
      name: string,
      driver: ExtendMailCallback,
      config: any
    ) => void
    extendPlugins: (plugins: PluginContract[]) => void
    extendEvents: (events: EventContract<DataPayload>) => void
  }

  export type ExtendMailCallback = (
    manager: MailManagerContract,
    name: string,
    config: MailConfig['mailers']
  ) => MailDriverContract

  export abstract class PluginContract {
    config: {
      id: string
      name: string
      extra?: DataPayload
      permissions: Permission[]
      boot: (config: PluginSetupConfig) => void | Promise<void>
      register: (config: PluginSetupConfig) => void | Promise<void>
    }
    id(id: string): this
    name(name: string): this
    extra(extra: DataPayload): this
    boot(setupFunction: PluginSetupFunction): this
    register(setupFunction: PluginSetupFunction): this
  }

  export class Plugin extends PluginContract {}

  export const plugin: (name: string) => PluginContract
}
