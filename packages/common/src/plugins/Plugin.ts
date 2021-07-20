import { paramCase } from 'change-case'
import {
  Permission,
  PluginContract,
  PluginSetupFunction,
  DataPayload
} from '@tensei/common'

export class Plugin implements PluginContract {
  public config: PluginContract['config'] = {
    id: '',
    name: '',
    extra: {},
    permissions: [] as Permission[],
    boot: () => Promise.resolve(),
    register: () => Promise.resolve()
  }

  constructor(name: string) {
    this.config.name = name
    this.config.id = paramCase(name)
  }

  id(id: string) {
    this.config.id = id

    return this
  }

  extra(extra: DataPayload) {
    this.config.extra = extra

    return this
  }

  name(name: string) {
    this.config.name = name

    return this
  }

  public permissions(permissions: Permission[]) {
    this.config.permissions = permissions

    return this
  }

  public boot(setupFunction: PluginSetupFunction) {
    this.config.boot = setupFunction

    return this
  }

  public register(setupFunction: PluginSetupFunction) {
    this.config.register = setupFunction

    return this
  }
}

export const plugin = (name: string) => new Plugin(name)
