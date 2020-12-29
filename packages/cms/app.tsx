import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'

import './core'

import Wrapper from './pages/Wrapper'

ReactDOM.render(<Wrapper />, document.querySelector('#app'))
