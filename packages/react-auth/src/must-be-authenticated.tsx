import { useAuth } from './use-auth'
import React, { FunctionComponent, ComponentType, useEffect } from 'react'

export interface Options {
    skipRedirect?: boolean
}

export const MustBeAuthenticated = <P extends object>(Component: ComponentType, options?: Options): FunctionComponent<P> => {
    return function MustBeAuthenticated(props: P) {
        const { isLoading, user, onRedirectCallback, loginPath, Loader } = useAuth()

        useEffect(() => {
            if (isLoading) {
                return
            }

            if (! user && ! options?.skipRedirect) {
                onRedirectCallback(loginPath)
            }
        }, [isLoading, user])

        if (isLoading) {
            return <Loader />
        }

        return user ? <Component {...props} /> : <Loader />
    }
}

export const MustBeNotAuthenticated = <P extends object>(Component: ComponentType, options?: Options): FunctionComponent<P> => {
    return function MustBeNotAuthenticated(props: P) {
        const { isLoading, user, onRedirectCallback, Loader, profilePath } = useAuth()

        useEffect(() => {
            if (isLoading) {
                return
            }

            if (user && ! options?.skipRedirect) {
                onRedirectCallback(profilePath)
            }
        }, [isLoading, user])

        if (isLoading) {
            return <Loader />
        }

        return user ? <Loader /> : <Component {...props} />
    }
}
