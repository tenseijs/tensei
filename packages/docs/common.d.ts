import { RouteExtendContract } from '@tensei/common'

declare module '@tensei/common' {
    interface RouteExtendContract {
        docs: {
            tags?: string[]
            summary?: string
            description?: string
        }
    }
}
