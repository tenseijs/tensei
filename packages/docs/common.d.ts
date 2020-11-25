import { RouteExtendContract, ResourceExtendContract } from '@tensei/common'

declare module '@tensei/common' {
    interface RouteExtendContract {
        docs?: {
            tags?: string[]
            summary?: string
            description?: string
            parameters?: any[]
            definitions?: any
            responses?: any
        }
    }

    interface ResourceExtendContract {
        docs?: {
            definitions?: any
        }
    }
}
