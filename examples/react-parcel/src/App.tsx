import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'

import { AuthContextProvider, useAuth, useTensei } from '@tensei/react-auth'

const Auth: React.FunctionComponent = () => {
    const tensei = useTensei()
    const { isLoading, user } = useAuth()

    const login = () => {
        tensei.auth().login({
            object: {
                email: 'parcel@tenseijs.com',
                password: 'password',
                accepted_terms_and_conditions: true
            }
        })
    }

    const logout = () => {
        tensei.auth().logout()
    }

    if (isLoading) {
        return null
    }

    if (user) {
        return (
            <>
                <button onClick={logout}>
                    Logout
                </button>
            </>
        )
    }

    return (
        <>
            <button onClick={login}>
                Login
            </button>
            <br />
            <br />
            <br />
            <a href={tensei.auth().socialRedirectUrl('google')}>
                Login with google
            </a>
        </>
    )
}

const App: React.FunctionComponent = () => {
    return (
        <BrowserRouter>
            <AuthContextProvider options={{
                refreshTokens: true
            }}>
                <Route component={Auth} path='/' />
            </AuthContextProvider>
        </BrowserRouter>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
)
