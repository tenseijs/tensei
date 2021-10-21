import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './core'
import './load-icons'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import '@tensei/eui/dist/eui_theme_tensei_light.css'
import { AuthRoutes } from '@components/auth/routes'
import { DashboardRoutes } from '@components/dashboard/routes'
import { useEuiTheme, EuiThemeProvider } from '@tensei/eui/lib/services/theme'

interface ThemeExtensions {
  colors: {
    bgShade: string
  }
}

const extensions = {
  colors: {
    LIGHT: {
      bgShade: '#f9f9f9'
    },
    DARK: {
      bgShade: '#f9f9f9'
    }
  }
}

const App: React.FunctionComponent = ({ children }) => {
  const { euiTheme } = useEuiTheme<ThemeExtensions>()

  return <StyledThemeProvider theme={euiTheme}>{children}</StyledThemeProvider>
}

ReactDOM.render(
  <BrowserRouter>
    <EuiThemeProvider modify={extensions}>
      <App>
        <AuthRoutes />
        <DashboardRoutes />
      </App>
    </EuiThemeProvider>
  </BrowserRouter>,
  document.querySelector('#app')
)

window.React = React as any
window.ReactDOM = ReactDOM
