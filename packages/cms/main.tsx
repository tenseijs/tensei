import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './core'

// Styles
import '@reach/accordion/styles.css'
import 'toastedjs/dist/toasted.min.css'
import '@tensei/components/styles/pulse.css'
import '@tensei/components/styles/flatpickr.css'

import Wrapper from './pages/Wrapper'

ReactDOM.render(
    <BrowserRouter>
        <Wrapper />
    </BrowserRouter>,
    document.querySelector('#app')
)

window.React = React as any
window.ReactDOM = ReactDOM
