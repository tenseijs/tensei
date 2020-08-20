import Express from 'express'
import { Asset } from '../config'
import { paramCase } from 'change-case'
import { Resource } from '../resources/Resource'

export interface ToolSetupConfig {
    resources: Resource[]
    app: Express.Application
    style: (name: Asset['name'], path: Asset['path']) => void
    script: (name: Asset['name'], path: Asset['path']) => void
}

export type ToolSetupFunction = (config: ToolSetupConfig) => Promise<any>

export type ToolBeforeDabaseSetupFunction = (
    config: ToolSetupConfig
) => Promise<any>
export type ToolAfterDatabaseSetupFunction = (
    config: ToolSetupConfig
) => Promise<any>

export type ToolBeforeCoreRoutesSetupFunction = (
    config: ToolSetupConfig
) => Promise<any>
export type ToolAfterCoreRoutesSetupFunction = (
    config: ToolSetupConfig
) => Promise<any>

export type ToolBeforeMiddlewareSetupFunction = (
    config: ToolSetupConfig
) => Promise<any>
export type ToolAfterMiddlewareSetupFunction = (
    config: ToolSetupConfig
) => Promise<any>

export type SetupFunctions =
    | 'setup'
    | 'beforeDatabaseSetup'
    | 'afterDatabaseSetup'
    | 'beforeMiddlewareSetup'
    | 'afterMiddlewareSetup'
    | 'beforeCoreRoutesSetup'
    | 'afterCoreRoutesSetup'

export class Tool {
    public data = {
        setup: (config: ToolSetupConfig) => Promise.resolve(),

        beforeDatabaseSetup: (config: ToolSetupConfig) => Promise.resolve(),
        afterDatabaseSetup: (config: ToolSetupConfig) => Promise.resolve(),

        beforeMiddlewareSetup: (config: ToolSetupConfig) => Promise.resolve(),
        afterMiddlewareSetup: (config: ToolSetupConfig) => Promise.resolve(),

        beforeCoreRoutesSetup: (config: ToolSetupConfig) => Promise.resolve(),
        afterCoreRoutesSetup: (config: ToolSetupConfig) => Promise.resolve(),
    }

    public slug: string = ''

    constructor(public name: string) {
        this.slug = paramCase(name)
    }

    private setValue(key: SetupFunctions, value: ToolSetupFunction) {
        this.data = {
            ...this.data,
            [key]: value,
        }
    }

    public setup(setupFunction: ToolSetupFunction) {
        this.setValue('setup', setupFunction)

        return this
    }

    public beforeDatabaseSetup(setupFunction: ToolSetupFunction) {
        this.setValue('beforeDatabaseSetup', setupFunction)

        return this
    }

    public afterDatabaseSetup(setupFunction: ToolSetupFunction) {
        this.setValue('afterDatabaseSetup', setupFunction)

        return this
    }

    public beforeMiddlewareSetup(setupFunction: ToolSetupFunction) {
        this.setValue('beforeMiddlewareSetup', setupFunction)

        return this
    }

    public afterMiddlewareSetup(setupFunction: ToolSetupFunction) {
        this.setValue('afterMiddlewareSetup', setupFunction)

        return this
    }

    public beforeCoreRoutesSetup(setupFunction: ToolSetupFunction) {
        this.setValue('beforeCoreRoutesSetup', setupFunction)

        return this
    }

    public afterCoreRoutesSetup(setupFunction: ToolSetupFunction) {
        this.setValue('afterCoreRoutesSetup', setupFunction)

        return this
    }
}

export const tool = (name: string) => new Tool(name)
