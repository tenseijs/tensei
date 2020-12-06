import { Tensei, SerializedTenseiState } from '@tensei/components'

declare global {
    interface Window {
        Tensei: Tensei
        ___tensei___: SerializedTenseiState
    }
}
