import 'styled-components'
import { EuiThemeComputed } from '@tensei/eui/lib/services/theme'

interface ThemeExtensions {
  colors: {
    bgShade: string
    primaryTransparent: string
  }
}

declare module 'styled-components' {
  export interface DefaultTheme extends EuiThemeComputed<ThemeExtensions> {}
}
