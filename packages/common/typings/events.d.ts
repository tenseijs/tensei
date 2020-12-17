declare module '@tensei/common/events' {
    import { DataPayload } from '@tensei/common/config'
    type EventListener<Payload> = (payload: Payload) => void | Promise<void>

    export interface EventConfigContract<Payload> {
        name: string
        listeners: EventListener<Payload>[]
    }

    export interface EventContract<Payload> {
        config: EventConfigContract<Payload>
        listen(listener: EventListener<Payload>): this
    }

    export const event: <Payload = DataPayload>(
        name: string
    ) => EventContract<Payload>
}
