import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'evergreen-ui'
import './core'
import theme from './evergreen'
// Styles
import '@reach/accordion/styles.css'
import 'toastedjs/dist/toasted.min.css'
import '@tensei/components/styles/pulse.css'
import '@tensei/components/styles/flatpickr.css'

import Wrapper from './pages/Wrapper'

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider value={theme}>
      <Wrapper />
    </ThemeProvider>
  </BrowserRouter>,
  document.querySelector('#app')
)

window.React = React as any
window.ReactDOM = ReactDOM
