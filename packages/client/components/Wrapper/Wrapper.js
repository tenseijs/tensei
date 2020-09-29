import React from 'react'
import Auth from '~/store/auth'
import LoginPage from '~/pages/Login'
import ForgotPasswordPage from '~/pages/ForgotPassword'
import ResetPasswordPage from '~/pages/ResetPassword'
import Resources from '~/store/resources'
import RegisterPage from '~/pages/Register'
import DashboardPage from '~/pages/Dashboard'
import { Route, BrowserRouter } from 'react-router-dom'

class Wrapper extends React.Component {
    state = {
        booted: false,
        user: window.Tensei.state.user,
        resources: window.Tensei.state.resources,
        dashboards: window.Tensei.state.dashboards,
        appConfig: window.Tensei.state.appConfig,
        permissions: window.Tensei.state.permissions,
        shouldShowRegistrationScreen:
            window.Tensei.state.shouldShowRegistrationScreen,
    }

    setUser = (user) => {
        this.setState({
            user,
        })
    }

    componentDidMount() {
        Tensei.setWrapperState = this.setState.bind(this)
    }

    render() {
        const {
            user,
            booted,
            resources,
            dashboards,
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
                        authorizedToFetch: (slug) =>
                            user ? permissions[`fetch:${slug}`] : false,
                        authorizedToShow: (slug) =>
                            user ? permissions[`show:${slug}`] : false,
                        authorizedToCreate: (slug) =>
                            user ? permissions[`create:${slug}`] : false,
                        authorizedToUpdate: (slug) =>
                            user ? permissions[`update:${slug}`] : false,
                        authorizedToDelete: (slug) =>
                            user ? permissions[`delete:${slug}`] : false,
                        authorizedToRunAction: (slug, resource) =>
                            user
                                ? permissions[`run:${resource}:${slug}`]
                                : false,
                    }}
                >
                    <Resources.Provider
                        value={{
                            resources,
                            dashboards,
                        }}
                    >
                        <Route
                            path={Tensei.getPath('')}
                            component={DashboardPage}
                        />
                        <Route
                            path={Tensei.getPath('auth/login')}
                            component={LoginPage}
                        />
                        <Route
                            path={Tensei.getPath('auth/password/new')}
                            component={ForgotPasswordPage}
                        />
                        <Route
                            path={Tensei.getPath('auth/password/reset/:token')}
                            component={ResetPasswordPage}
                        />
                        {shouldShowRegistrationScreen ? (
                            <Route
                                path={Tensei.getPath('auth/register')}
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
