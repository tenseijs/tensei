import { CommandConfig, CommandContract, DataPayload } from '@tensei/common'

export class Command<Parameter = DataPayload> implements CommandContract<Parameter> {
    config: CommandConfig<Parameter> = {
        name: 'Unnamed command',
        description: '',
        handler: () => {},
        signature: '',
    }

    constructor(name: string) {
        this.name(name)
    }

    signature(signature: string) {
        this.config.signature = signature

        return this
    }

    name(name: string) {
        this.config.name = name

        return this
    }

    description(description: string) {
        this.config.description = description

        return this
    }

    handle(handler: CommandConfig<Parameter>['handler']) {
        this.config.handler = handler

        return this
    }
}

export const command = (name: string) => new Command(name)
