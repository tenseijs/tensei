import * as common from '@tensei/common'

declare module '@tensei/common' {
    interface ResourceContract {
        Model: () => any
    }
}
