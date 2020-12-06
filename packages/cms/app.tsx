import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'

import './core'

import Dashboard from './pages/Dashboard'

ReactDOM.render(
    <ApolloProvider client={window.Tensei.client}>
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    </ApolloProvider>,
    document.querySelector('#app')
)
