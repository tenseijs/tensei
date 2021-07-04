import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AuthContextProvider, useTensei } from '@tensei/react-auth'

const Auth: React.FunctionComponent = () => {
    const tensei = useTensei()

    const login = () => {
        tensei.auth().login({
            object: {
                email: 'parcel@tenseijs.com',
                password: 'password',
                accepted_terms_and_conditions: true
            }
        })
    }

    return (
        <button onClick={login}>
            Login
        </button>
    )
}

const App: React.FunctionComponent = () => {
    return (
        <AuthContextProvider options={{
            refreshTokens: true
        }}>
            <Auth />
        </AuthContextProvider>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
)
