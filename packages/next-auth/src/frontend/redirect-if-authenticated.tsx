import { useRouter } from 'next/router'
import React, { ComponentType, useEffect } from 'react'

import { useAuth } from './use-auth'

export interface RedirectIfAuthenticatedOptions {
    redirectTo?: string
}

export type RedirectIfAuthenticated = <P>(
    Component: ComponentType<P>,
    options?: RedirectIfAuthenticatedOptions
  ) => React.FC<Omit<P, 'user'>>

export const redirectIfAuthenticated: RedirectIfAuthenticated = (Component, options = {}) => {
    return function redirectIfAuthenticated(props): JSX.Element {
        const { loading, user, config } = useAuth()
        const router = useRouter()

        useEffect(() => {
            if (loading || user) {
                return
            }

            router.push(options?.redirectTo || config.loginPath)
        }, [loading, user])

        if (user) {
            return (
                <Component user={{}} {...props as any} />
            )
        }

        return null
    }
} 