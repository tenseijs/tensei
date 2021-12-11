import 'styled-components'
import { EuiThemeComputed } from '@tensei/eui/lib/services/theme'

interface ThemeExtensions {
  colors: {
    bgShade: string
    primaryTransparent: string
    formControlBackground?: string
    formControlBoxShadow?: string
    formControlBgImage?: string
  }
}

declare module 'styled-components' {
  export interface DefaultTheme extends EuiThemeComputed<ThemeExtensions> {}
}
