import React from 'react'
import { Redirect } from 'react-router-dom'

import { mustBeAuthenticated } from '../../store/auth'

class DashboardPage extends React.Component {
    render() {
        return <div>this is the dashboard</div>
    }
}

export default mustBeAuthenticated(DashboardPage)
