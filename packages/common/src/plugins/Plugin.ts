import { paramCase } from 'change-case'
import {
    Permission,
    PluginContract,
    SetupFunctions,
    PluginSetupFunction
} from '@tensei/common'

export class Plugin implements PluginContract {
    public data = {
        permissions: [] as Permission[],
        boot: () => Promise.resolve(),
        register: () => Promise.resolve()
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

    public boot(setupFunction: PluginSetupFunction) {
        this.setValue('boot', setupFunction)

        return this
    }

    public register(setupFunction: PluginSetupFunction) {
        this.setValue('register', setupFunction)

        return this
    }
}

export const plugin = (name: string) => new Plugin(name)
