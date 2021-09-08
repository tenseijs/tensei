import { defaultTheme } from 'evergreen-ui'
import typography from './typography'

const tokens = {
  ...(defaultTheme as any).tokens,
  ...typography
}

export default tokens
