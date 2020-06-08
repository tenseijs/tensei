import React from 'react'
import LoginPage from '../../pages/Login'
import DashboardPage from '../../pages/Dashboard'
import { Route, Switch, BrowserRouter } from 'react-router-dom'

class Wrapper extends React.Component {
  state = (() => {
    let user = null

    try {
      JSON.parse(window.Flamingo.user)
    } catch (errors) {}

    return {
      user,
    }
  })()

  render() {
    return (
      <BrowserRouter>
        <Route path="/" component={DashboardPage} />
        <Route path="/auth/login" component={LoginPage} />
      </BrowserRouter>
    )
  }
}

export default Wrapper
