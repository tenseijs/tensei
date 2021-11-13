import React, { createContext, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './core'
import './load-icons'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import { TenseiCtxInterface, CmsRoute } from '@tensei/components'

import '@tensei/eui/dist/eui_theme_tensei_light.css'
import { TenseiCtx } from './pages/components/auth/context'
import { AuthRoutes } from './pages/components/auth/routes'
import { DashboardRoutes } from './pages/components/dashboard/routes'
import { useEuiTheme, EuiThemeProvider } from '@tensei/eui/lib/services/theme'

interface ThemeExtensions {
  colors: {
    bgShade: string
    primaryTransparent: string
  }
}

const extensions = {
  colors: {
    LIGHT: {
      bgShade: '#f9f9f9',
      primaryTransparent: 'rgba(35, 70, 248, 0.2)'
    },
    DARK: {
      bgShade: '#f9f9f9',
      primaryTransparent: 'rgba(35, 70, 248, 0.2)'
    }
  }
}

const App: React.FunctionComponent = ({ children }) => {
  const [booted, setBooted] = useState(false)
  const [routes, setRoutes] = useState<CmsRoute[]>([])
  const [user, setUser] = useState<TenseiCtxInterface['user']>(null as any)
  const { euiTheme } = useEuiTheme<ThemeExtensions>()

  const value = {
    user,
    setUser,
    booted,
    setBooted,
    routes,
    setRoutes
  }

  window.Tensei.ctx = value

  useEffect(() => {
    window.Tensei.client.get('csrf')
  }, [])

  return (
    <TenseiCtx.Provider value={value}>
      <StyledThemeProvider theme={euiTheme}>
        {booted ? children : 'Booting app...'}
      </StyledThemeProvider>
    </TenseiCtx.Provider>
  )
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
