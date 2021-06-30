import React, { createContext, FunctionComponent, useEffect, useState, useContext, useRef } from 'react'

import { getLoginUrl } from '../utils'

const UserContextDefaultData = {
    loading: true,
    setAuth() {},
    logout() {},
    config: {
        loginPath: getLoginUrl()
    }
}

interface AuthConfig {
    loginPath?: string
}

interface UserContextData {
    // @ts-ignore These types will be available after the tensei-sdk generate command is run by the developer.
    user?: import('@tensei/sdk').User
    expires_in?: number
    access_token?: string
    loading: boolean
    setAuth: (auth: UserContextData) => void
    logout: () => void
    config: AuthConfig
}

const UserContext = createContext<UserContextData>(UserContextDefaultData)

export const useAuth = () => {
    return useContext(UserContext)
}

export const UserProvider: FunctionComponent= ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [auth, setAuth] = useState<UserContextData>()

    const checkSession = () => {
        fetch('/api/auth/check-session')
            .then(response => response.json())
            .then((data) => {
                // Set an interval to dynamically call the API and call /api/auth/check-session

                setAuth({
                    ...auth,
                    ...data
                })
                setLoading(false)
            })
    }

    const logout = async () => {
        await fetch('/api/auth/logout')

        setAuth({
            ...auth,
            access_token: undefined,
            expires_in: undefined,
            user: undefined
        })
    }

    useEffect(() => {
        checkSession()
    }, [])

    const delay = auth?.expires_in ? (auth.expires_in - 10) * 1000 : 60 * 14 * 1000

    useInterval(() => {
        checkSession()

        // Stop the interval if there's no user.
    }, auth?.user ? delay : null)

    return (
        <UserContext.Provider value={{
            ...auth,
            loading,
            setAuth,
            logout,
        }}>
            {children}
        </UserContext.Provider>
    )
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return undefined
    }

    const id = setInterval(() => savedCallback.current(), delay)

    return () => clearInterval(id)
  }, [delay])
}

export default useInterval
