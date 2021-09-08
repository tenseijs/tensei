import tokens from './theme/tokens'
import components from './theme/components'
import { defaultTheme } from 'evergreen-ui'

export default {
  ...defaultTheme,
  tokens,
  ...tokens,
  components
}
