import { AuthPluginConfig } from '@tensei/auth'
import { PluginSetupConfig, ResourceContract } from '@tensei/common'

import { resolveFieldTypescriptType } from './helpers'

export const getAuthUserResponseInterface = (
	userResource: ResourceContract,
	authConfig: AuthPluginConfig
) => {
	return `
    export interface DataResponse<Response> {
        data: Response
    }

    export interface AuthResponse {
        ${userResource.data.snakeCaseName}: Tensei.${userResource.data.pascalCaseName}
        ${authConfig.httpOnlyCookiesAuth ? '' : 'access_token: string'}
        ${authConfig.httpOnlyCookiesAuth ? '' : 'expires_in: number'}
        ${authConfig.enableRefreshTokens ? 'refresh_token: string' : ''}
    }

    export type ResetPasswordResponse = true
    export type ForgotPasswordResponse = true
    `
}

export const generateAuthTypes = (authConfig: AuthPluginConfig, config: PluginSetupConfig) => {
	const interfaces = getInterfaceNames(authConfig)

	const userResource = config.resources.find(
		(resource) => resource.data.name === authConfig.userResource
	)

	const fields = userResource?.data.fields.filter(
		(field) =>
			!field.showHideFieldFromApi.hideOnInsertApi && !field.isHidden && field.databaseField !== 'id'
	)

	return `
        export interface ${interfaces.LoginInput} {
            email: string
            password: string
        }

        export interface ${interfaces.RegisterInput} {
            ${fields?.map(
							(field) =>
								`${field.databaseField}: ${resolveFieldTypescriptType(
									field,
									config.resources,
									true
								)}`
						)}
            password: string
        }

        export interface ${interfaces.ForgotPasswordInput} {
            email: string
        }

        export interface ${interfaces.ResetPasswordInput} {
            token: string
            password: string
        }

        export interface TokenStorage {
            name: string
            set<T>(value: T): void
            get<T>(): T
            clear: () => void
        }

        export interface TokenStorageValue {
            access_token_expires_in: number
            refresh_token: string
            current_time: string
        }
    `
}

export const getInterfaceNames = (config: AuthPluginConfig) => {
	return {
		LoginInput: `Login${config.userResource}Input`,
		RegisterInput: `Register${config.userResource}Input`,
		ForgotPasswordInput: `ForgotPasswordInput`,
		ResetPasswordInput: `ResetPasswordInput`,
	}
}

export const generateAuthApi = (config: PluginSetupConfig) => {
	const authPlugin = config.plugins.find((plugin) => plugin.config.name === 'Auth')

	if (!authPlugin) {
		return ``
	}

	const authConfig = authPlugin.config.extra as AuthPluginConfig

	const userResource = config.resources.find(
		(resource) => resource.data.name === authConfig.userResource
	)

	if (!userResource) {
		return ``
	}

	const interfaces = getInterfaceNames(authConfig)

	const apiPrefix = authConfig.apiPath
	const {
		refreshTokenHeaderName,
		tokensConfig: { refreshTokenExpiresIn },
	} = authConfig

	const apiPaths = {
		me: `${apiPrefix}/me`,
		login: `${apiPrefix}/login`,
		register: `${apiPrefix}/register`,
		forgotPassword: `${apiPrefix}/passwords/email`,
		resetPassword: `${apiPrefix}/passwords/reset`,
	}

	return `
    ${generateAuthTypes(authConfig, config)}
    ${getAuthUserResponseInterface(userResource!, authConfig)}
    export class LocalStorageStore implements TokenStorage {
        constructor(public name: string) {}

        set<T>(value: T) {
            localStorage.setItem(this.name, JSON.stringify(value))
        }

        get<T>() {
            return JSON.parse(localStorage.getItem(this.name)) as T
        }

        clear() {
            return localStorage.removeItem(this.name)
        }
    }

    function isBrowser() {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined'
    }

    export class AuthAPI {
        private storage: TokenStorage
        private session_interval: any = null

        private auth_response?: AuthResponse

        private on_refresh?: (response: AuthResponse) => void

        constructor(private instance: AxiosInstance) {
            this.storage = new LocalStorageStore('___tensei__session___')
        }

        /**
         * 
         * Login an existing ${authConfig.userResource.toLowerCase()}.
         *      Example:
         *          await tensei.auth.login({
         *              email: 'hey@tenseijs.com',
         *              password: 'password'
         *          })
         *
         **/
        async login(payload: { object: ${interfaces.LoginInput}, skipAuthentication?: boolean }) {
            const response = await this.instance.post<DataResponse<AuthResponse>>('${
							apiPaths.login
						}', payload.object)

            this.auth_response = response.data.data

            if (payload.skipAuthentication) {
                return response
            }

            ${
							authConfig.enableRefreshTokens
								? `
            this.authenticateWithRefreshTokens(response.data.data)
            `
								: ``
						}

            return response
        }

        /**
         * 
         * Fetch the authenticated ${userResource.data.snakeCaseName.toLowerCase()} details.
         * 
         **
        me() {
            return this.instance.get<DataResponse<AuthResponse>>('${apiPaths.me}')
        }

        ${
					authConfig.enableRefreshTokens
						? `
        /**
         * 
         * Silently get a new access token for an existing ${authConfig.userResource.toLowerCase()} session.
         *      Example:
         *          await tensei.auth.silentLogin()
         *
         **/
        async silentLogin() {
            if (! isBrowser()) {
                return
            }

            const session = this.storage.get<TokenStorageValue>()

            if (! session || ! this.isSessionValid(session)) {
                return this.logout()
            }

            try {
                const response = await this.refreshToken({ token: session.refresh_token })

                this.auth_response = response.data.data

                await this.authenticateWithRefreshTokens(response.data.data)

                if (this.on_refresh) {
                    this.on_refresh(this.auth_response)
                }
            } catch (errors) {
                this.logout()
            }
        }

        /**
         * 
         * Register event listener to be called after token is refreshed.
         *      Example:
         *          tensei.auth.onRefresh(() => {})
         * 
         **/
        onRefresh(fn: (auth: AuthResponse) => void) {
            this.on_refresh = fn
        }

        /**
         * 
         * Authenticate user with refresh token and
         * Start silent refresh countdown.
         * 
         **/
        private authenticateWithRefreshTokens(response: AuthResponse) {
            if (! isBrowser()) {
                return
            }

            const current_time = new Date().toISOString()

            this.storage.set<TokenStorageValue>({
                current_time,
                refresh_token: response.refresh_token,
                access_token_expires_in: response.expires_in,
            })

            if (this.session_interval) {
                return
            }

            // Trigger a token refresh 10 seconds before the current access token expires.
            this.session_interval = setInterval(() => {
                console.log('######## @@@@ interval invoked.', '--->current_time', current_time, '--->now', new Date().toISOString())
                this.silentLogin()
            }, (response.expires_in - 10) * 1000)
        }

        /**
         * 
         * Call API to get a new access token from valid refresh token.
         *      Example:
         *          await tensei.auth.refreshToken({ token: '6582ab8e9957f3d4e331a821823065c2cde0c32c8' })
         *
         **/
        refreshToken(payload: { token: string }) {
            return this.instance.get('${apiPrefix}' + '/refresh-token', {
                headers: {
                    '${refreshTokenHeaderName}': payload.token
                }
            })
        }

        /**
         * 
         * Check if a refresh token is still valid
         * 
         **/
        isSessionValid(session: TokenStorageValue) {
            const token_created_at = new Date(session.current_time)

            token_created_at.setSeconds(
                token_created_at.getSeconds() + ${refreshTokenExpiresIn}
            )

            return token_created_at > new Date()
        }
        `
						: ``
				}

        /**
         * 
         * Logout a currently logged in ${authConfig.userResource.toLowerCase()}.
         *      Example:
         *          await tensei.auth.logout()
         *
         **/
        logout(payload: { skipAuthentication?: boolean } = {}) {
            if (this.session_interval) {
                clearInterval(this.session_interval)
            }
        }

        /**
         * 
         * Register a ${authConfig.userResource.toLowerCase()}.
         *      Example:
         *          await tensei.auth.register({
         *              email: 'hey@tenseijs.com',
         *              password: 'password'
         *          })
         **/
        async register(payload: { object: ${
					interfaces.RegisterInput
				}, skipAuthentication?: boolean }) {
            const response = await this.instance.post<DataResponse<AuthResponse>>('${
							apiPaths.register
						}', payload.object)

            this.auth_response = response.data.data

            if (payload.skipAuthentication) {
                return response
            }

            ${
							authConfig.enableRefreshTokens
								? `
            this.authenticateWithRefreshTokens(response.data.data)
            `
								: ``
						}

            return response
        }

        /**
         * 
         * Request a password reset for a ${authConfig.userResource.toLowerCase()}.
         *      Example:
         *          await tensei.auth.forgotPassword({
         *              email: 'hey@tenseijs.com'
         *          })
         **/
        forgotPassword(payload: { object: ${interfaces.ForgotPasswordInput} }) {
            return this.instance.post<DataResponse<ForgotPasswordResponse>>('${
							apiPaths.forgotPassword
						}', payload.object)
        }

        /**
         * 
         * Reset a password for a ${authConfig.userResource.toLowerCase()} using a password reset token.
         *      Example:
         *          await tensei.auth.resetPassword({
         *              token: 'b8e9957f3d4e331a821823065c2cde0c32c8b54c',
         *              password: 'new-password'
         *          })
         **/
        resetPassword(payload: { object: ${interfaces.ResetPasswordInput} }) {
            return this.instance.post<DataResponse<ForgotPasswordResponse>>('${
							apiPaths.resetPassword
						}', payload.object)
        }
    }
    `
}
