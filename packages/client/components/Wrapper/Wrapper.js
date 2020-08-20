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
        permissions: window.Flamingo.state.permissions,
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
            booted,
            resources,
            permissions,
            shouldShowRegistrationScreen,
        } = this.state

        if (!booted) {
            return null
        }

        return (
            <BrowserRouter>
                <Auth.Provider
                    value={{
                        user,
                        permissions,
                        setUser: this.setUser,
                        shouldShowRegistrationScreen,
                        authorizedToSee: (slug) =>
                            user ? permissions[`read:${slug}`] : false,
                        authorizedToCreate: (slug) =>
                            user ? permissions[`create:${slug}`] : false,
                        authorizedToUpdate: (slug) =>
                            user ? permissions[`update:${slug}`] : false,
                        authorizedToDelete: (slug) =>
                            user ? permissions[`delete:${slug}`] : false,
                    }}
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
