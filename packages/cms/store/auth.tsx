import React from 'react'
import { Redirect } from 'react-router-dom'

export interface AuthContextValue {}

const Auth = React.createContext({})

export const withAuth = (Component: React.FunctionComponent<any>) => {
    const WithAuthComponent = (props: any) => (
        <Auth.Consumer>
            {value => <Component {...props} auth={value} />}
        </Auth.Consumer>
    )

    return WithAuthComponent
}

export const mustBeAuthenticated = (
    Component: React.FunctionComponent<any>
) => {
    const MustBeAuthComponent = (props: any) => (
        <Auth.Consumer>
            {value => {
                // const { user, shouldShowRegistrationScreen } = value

                // if (!user) {
                //     return (
                //         <Redirect
                //             to={Tensei.getPath(
                //                 shouldShowRegistrationScreen
                //                     ? 'auth/register'
                //                     : 'auth/login'
                //             )}
                //         />
                //     )
                // }

                // return <Component {...props} auth={value} />
                return null
            }}
        </Auth.Consumer>
    )

    return MustBeAuthComponent
}

export const mustBeNotAuthenticated = (Component: React.FunctionComponent) => {
    const MustBeNotAuthComponent = (props: any) => (
        <Auth.Consumer>
            {value => {
                // const { user } = value

                // if (user) {
                //     return <Redirect to={Tensei.getPath('')} />
                // }

                // return <Component {...props} auth={value} />
                return null
            }}
        </Auth.Consumer>
    )

    return MustBeNotAuthComponent
}

export default Auth
