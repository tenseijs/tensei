declare module '@tensei/common/commands' {
  import { DataPayload, Config } from '@tensei/common/config'

  export interface CommandConfig<Parameter> {
    name: string
    signature: string
    description: string
    handler: (parameters: Parameter, config: Config) => void | Promise<void>
  }

  export interface CommandContract<Parameter> {
    config: CommandConfig<Parameter>

    name: (name: string) => this

    signature: (signature: string) => this
    description: (description: string) => this
    handle: (handler: CommandConfig<Parameter>['handler']) => this
  }

  export const command: <P = DataPayload>(name: string) => CommandContract<P>
}
