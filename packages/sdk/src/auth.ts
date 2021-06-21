import { AxiosInstance } from 'axios'

export interface LoginCustomerInput {
	email: string
	password: string
}

export interface RegisterCustomerInput {
	email: string
	categories: string[]
	accepted_terms_and_conditions: boolean
	password: string
}

export interface ForgotPasswordInput {
	email: string
}

export interface ResetPasswordInput {
	token: string
	password: string
}

export interface TokenStorage {
	name: string
	set<T>(value: T): void
	get<T>(): T|null
	clear: () => void
}

export interface TokenStorageValue {
	access_token_expires_in: number
	refresh_token: string
	current_time: string
}

export interface AccessTokenStorageValue {
	access_token_expires_in: number
	access_token: string
	current_time: string
}

export interface DataResponse<Response> {
	data: Response
}

export interface AuthResponse {
	customer: any
	access_token: string
	expires_in: number
	refresh_token: string
}

export type ResetPasswordResponse = true
export type ForgotPasswordResponse = true

function getUrlParameter(name: string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export class LocalStorageStore implements TokenStorage {
	constructor(public name: string) {}

	set<T>(value: T) {
		localStorage.setItem(this.name, JSON.stringify(value))
	}

	get<T>() {
		try {
			return JSON.parse(localStorage.getItem(this.name) || '') as T
		} catch (error) {
			return null
		}
	}

	clear() {
		return localStorage.removeItem(this.name)
	}
}

function isBrowser() {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

function getLocation(href: string) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[1],
        host: match[2],
    }
}

export class AuthAPI {
	private storage: TokenStorage

	private session_interval: any = null

	private auth_response?: AuthResponse

	private on_refresh?: (response: AuthResponse) => void

	constructor(public instance: AxiosInstance) {
		this.storage = new LocalStorageStore('___tensei__session___')

		this.loadExistingSession()
	}

	private async loadExistingSession() {
		this.silentLogin()
	}

	session() {
		return this.auth_response
	}

	/**
	 *
	 * Login an existing customer.
	 *      Example:
	 *          await tensei.auth().login({
	 *              email: 'hey@tenseijs.com',
	 *              password: 'password'
	 *          })
	 *
	 **/
	async login(payload: { object: LoginCustomerInput; skipAuthentication?: boolean }) {
		const response = await this.instance.post<DataResponse<AuthResponse>>(
			'login',
			payload.object
		)

		this.auth_response = response.data.data

		if (payload.skipAuthentication) {
			return response
		}

		this.setAuthorizationHeader()

		this.authenticateWithRefreshTokens()
		this.authenticateWithAcessTokens()

		return response
	}

	private usesRefreshTokens() {
		if (this.auth_response?.refresh_token && this.auth_response?.access_token) {
			return true
		}
	}

	private usesAccessTokens() {
		return this.auth_response?.access_token && ! this.auth_response?.refresh_token
	}

	/**
           * 
           * Fetch the authenticated customer details.
           * 
           **
          me() {
              return this.instance.get<DataResponse<AuthResponse>>('auth/me')
          }
  
          
          /**
           * 
           * Silently get a new access token for an existing customer session.
           *      Example:
           *          await tensei.auth().silentLogin()
           *
           **/
	async silentLogin() {
		if (!isBrowser()) {
			return
		}

		const session = this.storage.get<TokenStorageValue>()

		if (!session || !this.isSessionValid(session)) {
			return this.logout()
		}
 
		try {
			const response = await this.refreshToken({ token: session.refresh_token })

			this.auth_response = response.data.data

			this.authenticateWithRefreshTokens()

			if (this.on_refresh && this.auth_response) {
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
	 *          tensei.auth().onRefresh(() => {})
	 *
	 **/
	onRefresh(fn: (auth: AuthResponse) => void) {
		this.on_refresh = fn
	}

	private setAuthorizationHeader() {
		this.instance.defaults.headers.common = {
			'Authorization': `Bearer ${this.auth_response?.access_token}`
		}
	}

	private authenticateWithAcessTokens() {
		this.setAuthorizationHeader()

		if (!isBrowser()) {
			return
		}

		// if access tokens are not turned on on the API:
		if (! this.auth_response?.access_token) {
			return
		}

		// if refresh tokens are turned on on the API:
		if (this.auth_response?.refresh_token) {
			return
		}

		const current_time = new Date().toISOString()

		this.storage.set<AccessTokenStorageValue>({
			current_time,
			access_token: this.auth_response.access_token,
			access_token_expires_in: this.auth_response.expires_in,
		})
	}

	/**
	 *
	 * Authenticate user with refresh token and
	 * Start silent refresh countdown.
	 *
	 **/
	private authenticateWithRefreshTokens() {
		this.setAuthorizationHeader()

		if (!isBrowser()) {
			return
		}

		// if refresh tokens are not turned on on the API:
		if (! this.auth_response?.refresh_token || ! this.auth_response?.access_token) {
			return
		}

		const current_time = new Date().toISOString()

		this.storage.set<TokenStorageValue>({
			current_time,
			refresh_token: this.auth_response.refresh_token,
			access_token_expires_in: this.auth_response.expires_in,
		})

		if (this.session_interval) {
			return
		}

		// Trigger a token refresh 10 seconds before the current access token expires.
		this.session_interval = setInterval(() => {
			this.silentLogin()
		}, (this.auth_response.expires_in - 10) * 1000)
	}

	/**
	 *
	 * Call API to get a new access token from valid refresh token.
	 *      Example:
	 *          await tensei.auth().refreshToken({ token: '6582ab8e9957f3d4e331a821823065c2cde0c32c8' })
	 *
	 **/
	refreshToken(payload: { token: string }) {
		return this.instance.get('refresh-token', {
			headers: {
				'x-tensei-refresh-token': payload.token,
			},
		})
	}

	/**
	 *
	 * Check if a refresh token is still valid
	 *
	 **/
	isSessionValid(session: TokenStorageValue|AccessTokenStorageValue) {
		const token_created_at = new Date(session.current_time)

		token_created_at.setSeconds(token_created_at.getSeconds() + 240)

		return token_created_at > new Date()
	}

	/**
	 *
	 * Logout a currently logged in customer.
	 *      Example:
	 *          await tensei.auth().logout()
	 *
	 **/
	logout() {
		if (this.session_interval) {
			clearInterval(this.session_interval)
		}

		if (isBrowser()) {
			this.storage.clear()
		}

		this.instance.defaults.headers.common['Authorization'] = undefined
	}

	/**
	 *
	 * Register a customer.
	 *      Example:
	 *          await tensei.auth().register({
	 *              email: 'hey@tenseijs.com',
	 *              password: 'password'
	 *          })
	 **/
	async register(payload: { object: any; skipAuthentication?: boolean }) {
		const response = await this.instance.post<DataResponse<AuthResponse>>(
			'register',
			payload.object
		)

		this.auth_response = response.data.data

		if (payload.skipAuthentication) {
			return response
		}

		this.authenticateWithRefreshTokens()

		return response
	}

	/**
	 *
	 * Request a password reset for a customer.
	 *      Example:
	 *          await tensei.auth().forgotPassword({
	 *              email: 'hey@tenseijs.com'
	 *          })
	 **/
	forgotPassword(payload: { object: ForgotPasswordInput }) {
		return this.instance.post<DataResponse<ForgotPasswordResponse>>(
			'passwords/email',
			payload.object
		)
	}

	/**
	 *
	 * Reset a password for a customer using a password reset token.
	 *      Example:
	 *          await tensei.auth().resetPassword({
	 *              token: 'b8e9957f3d4e331a821823065c2cde0c32c8b54c',
	 *              password: 'new-password'
	 *          })
	 **/
	resetPassword(payload: { object: ResetPasswordInput }) {
		return this.instance.post<DataResponse<ForgotPasswordResponse>>(
			'passwords/reset',
			payload.object
		)
	}

	resendVerificationEmail() {
		return this.instance.post('emails/verification/resend')
	}

	confirmEmail(payload: { object: any }) {
		return this.instance.post('emails/verification/confirm', payload.object)
	}

	enableTwoFactor() {
		return this.instance.post('two-factor/enable')
	}

	confirmTwoFactor() {
		return this.instance.post('two-factor/confirm')
	}

	disableTwoFactor() {
		return this.instance.post('two-factor/disable')
	}

	socialRedirectUrl(provider: string) {
		const { protocol, host } = getLocation(this.instance.defaults.baseURL!)!

		return `${protocol}//${host}/connect/${provider}`
	}

	private async handleSocial(type: string, payload: any) {
		const response = await this.instance.post(
			`social/${type}`,
			payload.object
		)

		this.auth_response = response.data.data

		if (payload.skipAuthentication) {
			return response
		}

		this.setAuthorizationHeader()

		this.authenticateWithRefreshTokens()

		return response
	}

	async socialLogin(payload: any) {
		return this.handleSocial('login', this.getSocialPayload(payload))
	}

	async socialRegister(payload: any) {
		return this.handleSocial('register', this.getSocialPayload(payload))
	}

	private getSocialPayload(payload: any) {
		if (! payload) {
			return {
				object: {
					access_token: getUrlParameter('access_token')
				},
			}
		}

		return payload
	}

	socialConfirm(payload: any) {
		return this.handleSocial('confirm', this.getSocialPayload(payload))
	}
}
