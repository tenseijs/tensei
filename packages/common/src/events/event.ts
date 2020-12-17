import {
    EventContract,
    EventConfigContract,
    DataPayload,
    EventListener
} from '@tensei/common'

export class Event<Payload = DataPayload> implements EventContract<Payload> {
    config: EventConfigContract<Payload> = {
        name: '',
        listeners: []
    }

    constructor(name: string) {
        this.config.name = name
    }

    listen(listener: EventListener<Payload>) {
        this.config.listeners = [...this.config.listeners, listener]

        return this
    }
}

export const event = <Payload = DataPayload>(name: string) =>
    new Event<Payload>(name)
