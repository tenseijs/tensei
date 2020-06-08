import React from 'react'
import Auth from '../../store/auth'
import LoginPage from '../../pages/Login'
import DashboardPage from '../../pages/Dashboard'
import { Route, BrowserRouter } from 'react-router-dom'

class Wrapper extends React.Component {
    state = (() => {
        let user = null

        try {
            user = JSON.parse(window.Flamingo.user)
        } catch (errors) {}

        return {
            user,
        }
    })()

    setUser = (user) => {
        this.setState({
            user,
        })
    }

    render() {
        return (
            <BrowserRouter>
                <Auth.Provider value={[this.state.user, this.setUser]}>
                    <Route path="/" component={DashboardPage} />
                    <Route path="/auth/login" component={LoginPage} />
                </Auth.Provider>
            </BrowserRouter>
        )
    }
}

export default Wrapper
