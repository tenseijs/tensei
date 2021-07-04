import { sdk } from '@tensei/sdk'
import React, { createContext, useContext, FunctionComponent, useState, useEffect } from 'react'


export interface AuthContextInterface {
    isLoading: boolean
    accessToken?: string
    // @ts-ignore
    tensei: import('@tensei/sdk').SdkContract
    // @ts-ignore
    user: import('@tensei/sdk').AuthResponse['user']
    // @ts-ignore
    setAuth: (response?: import('@tensei/sdk').AuthResponse) => void
}

export const AuthContext = createContext<AuthContextInterface>({
    isLoading: true,
    tensei: {} as any,
    user: undefined as any,
    setAuth: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const useTensei = () => {
    const { tensei } = useAuth()

    return tensei
}

export interface AuthContextWrapperProps {
    tensei?: AuthContextInterface['tensei']

    // @ts-ignore
    options?: import('@tensei/sdk').SdkOptions
}

export const AuthContextProvider: FunctionComponent<AuthContextWrapperProps> = ({ children, tensei: tenseiInstance, options }) => {
    const [accessToken, setAccessToken] = useState<string>()
    const [user, setUser] = useState<AuthContextInterface['user']>()
    const [tensei] = useState(tenseiInstance ? tenseiInstance : sdk(options))
    const [isLoading, setIsLoading] = useState<AuthContextInterface['isLoading']>(true)

    const subscribeToAuthChanges = () => {
        tensei.auth().listen((auth: any) => {
            setUser(auth?.user || null)
            setAccessToken(auth?.access_token)
        })
    }

    const loadExistingSession = async () => {
        await tensei.auth().loadExistingSession()

        setIsLoading(false)
    }

    // @ts-ignore
    const setAuth = (response?: import('@tensei/sdk').AuthResponse) => {
        setUser(response?.user || null)
        setAccessToken(response?.access_token)
    }

    useEffect(() => {
        subscribeToAuthChanges()
        loadExistingSession()
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            tensei,
            setAuth,
            isLoading,
            accessToken
        }}>
            {children}
        </AuthContext.Provider>
    )
}
