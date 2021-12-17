import { Tensei, SerializedTenseiState } from '@tensei/components'
import { AxiosStatic } from 'axios'
import * as styled from 'styled-components'

declare global {
  interface Window {
    Tensei: Tensei
    axios: AxiosStatic
    ___tensei___: SerializedTenseiState
    styled: typeof styled & {
      styled: typeof styled.default
    }
  }
}
