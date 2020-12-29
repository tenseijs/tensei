import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import Dashboard from '../Dashboard'

const Wrapper: React.FC = () => {
    return (
        <BrowserRouter>
            <Route component={Dashboard} path={window.Tensei.getPath('')} />
        </BrowserRouter>
    )
}

export default Wrapper
