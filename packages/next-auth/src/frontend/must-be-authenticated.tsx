import { useRouter } from 'next/router'
import React, { ComponentType, useEffect } from 'react'

import { useAuth } from './use-auth'

export interface MustBeAuthenticatedOptions {
    redirectTo?: string
}

export type MustBeAuthenticated = <P>(
    Component: ComponentType<P>,
    options?: MustBeAuthenticatedOptions
  ) => React.FC<Omit<P, 'user'>>

export const mustBeAuthenticated: MustBeAuthenticated = (Component, options = {}) => {
    return function mustBeAuthenticated(props): JSX.Element {
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