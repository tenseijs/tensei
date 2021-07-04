import { AxiosStatic } from 'axios'
import { Tensei, SerializedTenseiState } from './src/types'

declare global {
  interface Window {
    Tensei: Tensei
    axios: AxiosStatic
    ___tensei___: SerializedTenseiState
  }
}
