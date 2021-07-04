import { Tensei, SerializedTenseiState } from '@tensei/components'
import { AxiosStatic } from 'axios'

declare global {
  interface Window {
    Tensei: Tensei
    axios: AxiosStatic
    ___tensei___: SerializedTenseiState
  }
}
