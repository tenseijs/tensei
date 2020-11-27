import { paramCase } from 'change-case'
import {
    PluginSetupConfig,
    PluginSetupFunction,
    SetupFunctions,
    PluginContract,
    Permission,
    ServerStartedPluginSetupFunction
} from '@tensei/common'

export class Plugin implements PluginContract {
    public data = {
        permissions: [] as Permission[],
        setup: (config: PluginSetupConfig) => Promise.resolve(),

        serverStarted: () => {},
        beforeDatabaseSetup: (config: PluginSetupConfig) => Promise.resolve(),
        afterDatabaseSetup: (config: PluginSetupConfig) => Promise.resolve(),

        beforeMiddlewareSetup: (config: PluginSetupConfig) => Promise.resolve(),
        afterMiddlewareSetup: (config: PluginSetupConfig) => Promise.resolve(),

        beforeCoreRoutesSetup: (config: PluginSetupConfig) => Promise.resolve(),
        afterCoreRoutesSetup: (config: PluginSetupConfig) => Promise.resolve()
    }

    public slug: string = ''

    constructor(public name: string) {
        this.slug = paramCase(name)
    }

    private setValue(key: SetupFunctions, value: PluginSetupFunction) {
        this.data = {
            ...this.data,
            [key]: value
        }
    }

    public permissions(permissions: Permission[]) {
        this.data.permissions = permissions

        return this
    }

    public setup(setupFunction: PluginSetupFunction) {
        this.setValue('setup', setupFunction)

        return this
    }

    public serverStarted(setupFunction: PluginSetupFunction) {
        this.setValue('serverStarted', setupFunction)

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
