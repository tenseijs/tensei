import React from 'react'
import { Redirect } from 'react-router-dom'

import { mustBeAuthenticated } from '../../store/auth'

class DashboardPage extends React.Component {
    render() {
        return (
            <div className="w-full">
                <div className="w-1/6 h-screen">
                    <div className="w-full h-12 bg-blue-500">

                    </div>
                    <div className="w-full bg-blue-900" style={{ height: `calc(100vh - 3rem)` }}>

                    </div>
                </div>

                <div className="w-5/6">

                </div>
            </div>
        )
    }
}

export default mustBeAuthenticated(DashboardPage)
