import Express from 'express'
import { Asset } from '../config'
import { paramCase } from 'change-case'
import { Resource } from '../resources/Resource'

export interface PluginSetupConfig {
    resources: Resource[]
    app: Express.Application
    resourcesMap: {
        [key: string]: Resource
    }
    pushResource: (resource: Resource) => void
    style: (name: Asset['name'], path: Asset['path']) => void
    script: (name: Asset['name'], path: Asset['path']) => void
}

export type PluginSetupFunction = (config: PluginSetupConfig) => Promise<any>

export type PluginBeforeDabaseSetupFunction = (
    config: PluginSetupConfig
) => Promise<any>
export type PluginAfterDatabaseSetupFunction = (
    config: PluginSetupConfig
) => Promise<any>

export type PluginBeforeCoreRoutesSetupFunction = (
    config: PluginSetupConfig
) => Promise<any>
export type PluginAfterCoreRoutesSetupFunction = (
    config: PluginSetupConfig
) => Promise<any>

export type PluginBeforeMiddlewareSetupFunction = (
    config: PluginSetupConfig
) => Promise<any>
export type PluginAfterMiddlewareSetupFunction = (
    config: PluginSetupConfig
) => Promise<any>

export type SetupFunctions =
    | 'setup'
    | 'beforeDatabaseSetup'
    | 'afterDatabaseSetup'
    | 'beforeMiddlewareSetup'
    | 'afterMiddlewareSetup'
    | 'beforeCoreRoutesSetup'
    | 'afterCoreRoutesSetup'

export class Plugin {
    public data = {
        setup: (config: PluginSetupConfig) => Promise.resolve(),

        beforeDatabaseSetup: (config: PluginSetupConfig) => Promise.resolve(),
        afterDatabaseSetup: (config: PluginSetupConfig) => Promise.resolve(),

        beforeMiddlewareSetup: (config: PluginSetupConfig) => Promise.resolve(),
        afterMiddlewareSetup: (config: PluginSetupConfig) => Promise.resolve(),

        beforeCoreRoutesSetup: (config: PluginSetupConfig) => Promise.resolve(),
        afterCoreRoutesSetup: (config: PluginSetupConfig) => Promise.resolve(),
    }

    public slug: string = ''

    constructor(public name: string) {
        this.slug = paramCase(name)
    }

    private setValue(key: SetupFunctions, value: PluginSetupFunction) {
        this.data = {
            ...this.data,
            [key]: value,
        }
    }

    public setup(setupFunction: PluginSetupFunction) {
        this.setValue('setup', setupFunction)

        return this
    }

    public beforeDatabaseSetup(setupFunction: PluginSetupFunction) {
        this.setValue('beforeDatabaseSetup', setupFunction)

        return this
    }

    public afterDatabaseSetup(setupFunction: PluginSetupFunction) {
        this.setValue('afterDatabaseSetup', setupFunction)

        return this
    }

    public beforeMiddlewareSetup(setupFunction: PluginSetupFunction) {
        this.setValue('beforeMiddlewareSetup', setupFunction)

        return this
    }

    public afterMiddlewareSetup(setupFunction: PluginSetupFunction) {
        this.setValue('afterMiddlewareSetup', setupFunction)

        return this
    }

    public beforeCoreRoutesSetup(setupFunction: PluginSetupFunction) {
        this.setValue('beforeCoreRoutesSetup', setupFunction)

        return this
    }

    public afterCoreRoutesSetup(setupFunction: PluginSetupFunction) {
        this.setValue('afterCoreRoutesSetup', setupFunction)

        return this
    }
}

export const plugin = (name: string) => new Plugin(name)
