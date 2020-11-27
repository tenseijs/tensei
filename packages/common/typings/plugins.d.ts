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
    import { ResourceContract, ManagerContract } from '@tensei/common/resources'
    import {
        Asset,
        EndpointMiddleware,
        Config,
        Permission,
        SupportedStorageDrivers,
        StorageConstructor,
        GraphQLPluginExtension,
        RouteContract,
        GraphQlQueryContract
    } from '@tensei/common/config'

    type PluginSetupFunction = (config: PluginSetupConfig) => Promise<any>

    type ServerStartedPluginSetupFunction = (
        config: PluginSetupConfig & {
            server: Server
        }
    ) => void

    type SetupFunctions =
        | 'setup'
        | 'beforeDatabaseSetup'
        | 'afterDatabaseSetup'
        | 'beforeMiddlewareSetup'
        | 'afterMiddlewareSetup'
        | 'beforeCoreRoutesSetup'
        | 'afterCoreRoutesSetup'
        | 'serverStarted'

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
            storageImplementation: StorageConstructor<
                StorageDriverImplementation
            >
        ): void
        manager: EntityManager | null
        gql: (types: string | TemplateStringsArray) => DocumentNode
        pushResource: (resource: ResourceContract) => void
        pushMiddleware: (middleware: EndpointMiddleware) => void
        style: (name: Asset['name'], path: Asset['path']) => void
        script: (name: Asset['name'], path: Asset['path']) => void
        extendGraphQlQueries: (queries: GraphQlQueryContract[]) => any
        extendGraphQlTypeDefs: (typeDefs: (string | DocumentNode)[]) => any
        extendRoutes: (queries: RouteContract[]) => any
    }

    export abstract class PluginContract {
        name: string
        slug: string
        data: {
            permissions: Permission[]
            setup: (config: PluginSetupConfig) => void | Promise<void>
            serverStarted: (config: PluginSetupConfig) => void | Promise<void>
            beforeDatabaseSetup: (
                config: PluginSetupConfig
            ) => void | Promise<void>
            afterDatabaseSetup: (
                config: PluginSetupConfig
            ) => void | Promise<void>
            beforeMiddlewareSetup: (
                config: PluginSetupConfig
            ) => void | Promise<void>
            afterMiddlewareSetup: (
                config: PluginSetupConfig
            ) => void | Promise<void>
            beforeCoreRoutesSetup: (
                config: PluginSetupConfig
            ) => void | Promise<void>
            afterCoreRoutesSetup: (
                config: PluginSetupConfig
            ) => void | Promise<void>
        }
        setup(setupFunction: PluginSetupFunction): this
        serverStarted: (setupFunction: PluginSetupFunction) => this
        beforeDatabaseSetup(setupFunction: PluginSetupFunction): this
        afterDatabaseSetup(setupFunction: PluginSetupFunction): this
        beforeMiddlewareSetup(setupFunction: PluginSetupFunction): this
        afterMiddlewareSetup(setupFunction: PluginSetupFunction): this
        beforeCoreRoutesSetup(setupFunction: PluginSetupFunction): this
        afterCoreRoutesSetup(setupFunction: PluginSetupFunction): this
    }

    export declare class Plugin extends PluginContract {}

    export const plugin: (name: string) => PluginContract
}
