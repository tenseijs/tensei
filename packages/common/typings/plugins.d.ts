declare module '@tensei/common/plugins' {
    import { Application } from 'express'
    import {
        Storage,
        StorageManager,
        StorageManagerConfig
    } from '@slynova/flydrive'
    import { DocumentNode } from 'graphql'
    import { Server } from 'http'
    import { EntityManager } from '@mikro-orm/core'
    import { MailDriverContract, MailConfig } from '@tensei/mail'
    import { ResourceContract, ManagerContract } from '@tensei/common/resources'
    import {
        Asset,
        Config,
        Permission,
        SupportedStorageDrivers,
        StorageConstructor,
        GraphQLPluginExtension,
        RouteContract,
        GraphQlQueryContract,
        TensieContext,
        RouteConfig,
        EventContract,
        DataPayload
    } from '@tensei/common/config'

    type PluginSetupFunction = (
        config: PluginSetupConfig
    ) => void | Promise<void>

    type SetupFunctions = 'boot' | 'register'

    interface PluginSetupConfig extends Config {
        resources: ResourceContract[]
        app: Application
        server: Server
        resourcesMap: {
            [key: string]: ResourceContract
        }
        storageDriver<
            StorageDriverImplementation extends Storage,
            DriverConfig extends unknown
        >(
            driverName: SupportedStorageDrivers,
            driverConfig: DriverConfig,
            storageImplementation: StorageConstructor<StorageDriverImplementation>
        ): void
        manager: EntityManager | null
        gql: (types: string | TemplateStringsArray) => DocumentNode
        style: (name: Asset['name'], path: Asset['path']) => void
        script: (name: Asset['name'], path: Asset['path']) => void
        extendGraphQlQueries: (queries: GraphQlQueryContract[]) => any
        extendGraphQlTypeDefs: (typeDefs: (string | DocumentNode)[]) => any
        extendRoutes: (queries: RouteContract[]) => any
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
