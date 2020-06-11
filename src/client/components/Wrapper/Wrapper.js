import React from 'react'
import Auth from 'store/auth'
import LoginPage from 'pages/Login'
import Resources from 'store/resources'
import DashboardPage from 'pages/Dashboard'
import { Route, BrowserRouter } from 'react-router-dom'

class Wrapper extends React.Component {
    state = {
        user: window.Flamingo.state.user,
        resources: window.Flamingo.state.resources,
    }

    setUser = (user) => {
        this.setState({
            user,
        })
    }

    render() {
        return (
            <BrowserRouter>
                <Auth.Provider value={[this.state.user, this.setUser]}>
                    <Resources.Provider
                        value={{
                            resources: this.state.resources,
                        }}
                    >
                        <Route path="/" component={DashboardPage} />
                        <Route path="/auth/login" component={LoginPage} />
                    </Resources.Provider>
                </Auth.Provider>
            </BrowserRouter>
        )
    }
}

export default Wrapper
