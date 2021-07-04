import { sdk } from '@tensei/sdk'
import React, { createContext, useContext, FunctionComponent, useState, useEffect } from 'react'


export interface TenseiAuthContextInterface {
    isLoading: boolean
    accessToken?: string
    // @ts-ignore
    tensei: import('@tensei/sdk').SdkContract
    // @ts-ignore
    user: import('@tensei/sdk').AuthResponse['user']
    // @ts-ignore
    setAuth: (response?: import('@tensei/sdk').AuthResponse) => void
}

export const TenseiAuthContext = createContext<TenseiAuthContextInterface>({
    isLoading: true,
    tensei: {} as any,
    user: undefined as any,
    setAuth: () => {},
})

export const useAuth = () => useContext(TenseiAuthContext)

export const useTensei: () => TenseiAuthContextInterface['tensei'] = () => useAuth().tensei

export interface TenseiAuthProviderProps {
    tensei?: TenseiAuthContextInterface['tensei']

    // @ts-ignore
    options?: import('@tensei/sdk').SdkOptions
}

function getUrlParameter(name: string) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
	var results = regex.exec(location.search)
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

export const TenseiAuthProvider: FunctionComponent<TenseiAuthProviderProps> = ({ children, tensei: tenseiInstance, options }) => {
    const [accessToken, setAccessToken] = useState<string>()
    const [user, setUser] = useState<TenseiAuthContextInterface['user']>()
    const [tensei] = useState(tenseiInstance ? tenseiInstance : sdk(options))
    const [isLoading, setIsLoading] = useState<TenseiAuthContextInterface['isLoading']>(true)

    const subscribeToAuthChanges = () => {
        tensei.auth().listen((auth: any) => {
            setIsLoading(false)

            setUser(auth?.user || null)
            setAccessToken(auth?.access_token)
        })
    }

    const loadExistingSession = async () => {
        await tensei.auth().loadExistingSession()
    }

    // @ts-ignore
    const setAuth = (response?: import('@tensei/sdk').AuthResponse) => {
        setUser(response?.user || null)
        setAccessToken(response?.access_token)
    }

    const loadSocialAuth = () => {
        tensei.auth().socialConfirm()
            .catch(console.error)
    }

    const init = async () => {
        subscribeToAuthChanges()

        // If there's an access token, then we might need to handle social authentication
        if (getUrlParameter('access_token') && getUrlParameter('provider')) {
            return loadSocialAuth()
        }

        await loadExistingSession()
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <TenseiAuthContext.Provider value={{
            user,
            tensei,
            setAuth,
            isLoading,
            accessToken
        }}>
            {children}
        </TenseiAuthContext.Provider>
    )
}
