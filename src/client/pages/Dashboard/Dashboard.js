import React from 'react'
import { Redirect } from 'react-router-dom'

class DashboardPage extends React.Component {
  render() {
    if (true) {
      return <Redirect to="/auth/login" />
    }

    return <div>this is the dashboard</div>
  }
}

export default DashboardPage
