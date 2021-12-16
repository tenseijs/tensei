import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './core'
import './load-icons'
import { ThemeProvider } from 'styled-components'

import { CmsRoute } from '@tensei/components'
import { useAuthStore } from './store/auth'
import { useToastStore } from './store/toast'

import '@tensei/eui/dist/eui_theme_tensei_light.css'
import { AuthRoutes } from './pages/components/auth/routes'
import { DashboardRoutes } from './pages/components/dashboard/routes'
import { useEuiTheme, EuiThemeProvider } from '@tensei/eui/lib/services/theme'
import { EuiGlobalToastList } from '@tensei/eui/lib/components/toast/global_toast_list'

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
      primaryTransparent: 'rgba(44, 69, 239, 0.06)',
      formControlBackground: '#fbfcfd',
      formControlBoxShadow:
        '0 0 transparent, inset 0 0 0 1px rgb(69 45 164 / 10%)',
      formControlBgImage:
        'linear-gradient(to top, #2346F8, #2346F8 2px, transparent 2px, transparent 100%)'
    },
    DARK: {
      bgShade: '#f9f9f9',
      primaryTransparent: 'rgba(44, 69, 239, 0.06)',
      formControlBackground: '#fbfcfd',
      formControlBoxShadow:
        '0 0 transparent, inset 0 0 0 1px rgb(69 45 164 / 10%)',
      formControlBgImage:
        'linear-gradient(to top, #2346F8, #2346F8 2px, transparent 2px, transparent 100%)'
    }
  }
}

const App: React.FunctionComponent = ({ children }) => {
  const [booted, setBooted] = useState(false)
  const [routes, setRoutes] = useState<CmsRoute[]>([])
  const { euiTheme } = useEuiTheme<ThemeExtensions>()
  const { toasts, remove } = useToastStore()

  const { user, setUser } = useAuthStore()

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
    <>
      <EuiGlobalToastList
        toasts={toasts}
        toastLifeTimeMs={6000}
        dismissToast={remove}
      ></EuiGlobalToastList>
      <ThemeProvider theme={euiTheme}>
        {booted ? children : 'Booting app...'}
      </ThemeProvider>
    </>
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
