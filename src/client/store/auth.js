import React from 'react'
import { Redirect } from 'react-router-dom'

const Auth = React.createContext([])

export const withAuth = (Component) => {
    const WithAuthComponent = (props) => (
        <Auth.Consumer>
            {(value) => <Component {...props} auth={value} />}
        </Auth.Consumer>
    )

    return WithAuthComponent
}

export const mustBeAuthenticated = (Component) => {
    const MustBeAuthComponent = (props) => (
        <Auth.Consumer>
            {(value) => {
                if (!value[0]) {
                    return <Redirect to="/auth/login" />
                }

                return <Component {...props} auth={value} />
            }}
        </Auth.Consumer>
    )

    return MustBeAuthComponent
}

export const mustBeNotAuthenticated = (Component) => {
    const MustBeNotAuthComponent = (props) => (
        <Auth.Consumer>
            {(value) => {
                if (value[0]) {
                    return <Redirect to="/" />
                }

                return <Component {...props} auth={value} />
            }}
        </Auth.Consumer>
    )

    return MustBeNotAuthComponent
}

export default Auth
