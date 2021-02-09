declare module '@tensei/common/events' {
    import { DataPayload, Config } from '@tensei/common/config'

    type EventListener<Payload = DataPayload> = (data: {
        payload: Payload
        ctx: Config
    }) => void | Promise<void>

    export interface EventConfigContract<Payload> {
        name: string
        listeners: EventListener<Payload>[]
    }

    export interface EventContract<Payload = DataPayload> {
        config: EventConfigContract<Payload>
        listen(listener: EventListener<Payload>): this
    }

    export const event: <Payload = DataPayload>(
        name: string
    ) => EventContract<Payload>
}
