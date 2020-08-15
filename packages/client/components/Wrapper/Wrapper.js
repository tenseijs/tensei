import React from 'react'
import Auth from '~/store/auth'
import LoginPage from '~/pages/Login'
import Resources from '~/store/resources'
import RegisterPage from '~/pages/Register'
import DashboardPage from '~/pages/Dashboard'
import { Route, BrowserRouter } from 'react-router-dom'

class Wrapper extends React.Component {
    state = {
        booted: false,
        user: window.Flamingo.state.user,
        resources: window.Flamingo.state.resources,
        appConfig: window.Flamingo.state.appConfig,
        shouldShowRegistrationScreen:
            window.Flamingo.state.shouldShowRegistrationScreen,
    }

    setUser = (user) => {
        this.setState({
            user,
        })
    }

    componentDidMount() {
        Flamingo.setWrapperState = this.setState.bind(this)
    }

    render() {
        const {
            user,
            shouldShowRegistrationScreen,
            resources,
            booted,
        } = this.state

        if (!booted) {
            return false
        }

        return (
            <BrowserRouter>
                <Auth.Provider
                    value={[user, this.setUser, shouldShowRegistrationScreen]}
                >
                    <Resources.Provider
                        value={{
                            resources,
                        }}
                    >
                        <Route
                            path={Flamingo.getPath('')}
                            component={DashboardPage}
                        />
                        <Route
                            path={Flamingo.getPath('auth/login')}
                            component={LoginPage}
                        />
                        {shouldShowRegistrationScreen ? (
                            <Route
                                path={Flamingo.getPath('auth/register')}
                                component={RegisterPage}
                            />
                        ) : null}
                    </Resources.Provider>
                </Auth.Provider>
            </BrowserRouter>
        )
    }
}

export default Wrapper
