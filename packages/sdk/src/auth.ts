import { AxiosInstance } from 'axios'
import { SdkOptions } from './config'

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
  get<T>(): T | null
  clear: () => void
}

export interface TokenStorageValue {
  accessTokenExpiresIn: number
  refreshToken: string
  currentTime: string
}

export interface AccessTokenStorageValue {
  accessTokenExpiresAt: string
  accessToken: string
  currentTime: string
  expiresIn: number
}

export interface DataResponse<Response> {
  data: Response
}

export interface AuthResponse {
  customer: any
  accessToken: string
  expiresIn: number
  refreshToken: string
}

export type ResetPasswordResponse = true
export type ForgotPasswordResponse = true

function getUrlParameter(name: string) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  var results = regex.exec(location.search)
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '))
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
  var match = href.match(
    /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
  )
  return (
    match && {
      protocol: match[1],
      host: match[2]
    }
  )
}

export class AuthAPI {
  private storage: TokenStorage

  private session_interval: any = null

  private auth_response?: AuthResponse

  private on_auth_update?: (response?: AuthResponse) => void

  constructor(public instance: AxiosInstance, public options?: SdkOptions) {
    this.storage = new LocalStorageStore('___tensei__session___')
  }

  public async loadExistingSession() {
    if (this.usesRefreshTokens()) {
      this.silentLogin()
    }

    if (this.usesAccessTokens()) {
      await this.me()
    }
  }

  public async me() {
    const session = this.storage.get<AccessTokenStorageValue>()

    if (!session || !this.isSessionValid(session)) {
      this.logout()

      return null
    }

    let response

    try {
      response = await this.instance.get('me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      })
    } catch (errors) {
      this.logout()

      throw errors
    }

    this.auth_response = {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn
    } as any

    this.updateUser(response.data.data)

    this.setAuthorizationHeader()

    return this.auth_response
  }

  private getUserKey() {
    return 'user'
  }

  session() {
    return this.auth_response
  }

  async login(payload: {
    object: LoginCustomerInput
    skipAuthentication?: boolean
  }) {
    const response = await this.instance.post<DataResponse<AuthResponse>>(
      'login',
      payload.object
    )

    this.auth_response = response.data.data

    this.invokeAuthChange()

    if (payload.skipAuthentication) {
      return response
    }

    this.setAuthorizationHeader()

    this.authenticateWithRefreshTokens()
    this.authenticateWithAccessTokens()

    return response
  }

  private usesRefreshTokens() {
    return this.options?.refreshTokens
  }

  private usesAccessTokens() {
    return !this.options?.refreshTokens
  }

  async silentLogin() {
    if (!isBrowser()) {
      return
    }

    const session = this.storage.get<TokenStorageValue>()

    if (!session || !this.isRefreshSessionValid(session)) {
      return this.logout()
    }

    try {
      const response = await this.refreshToken({ token: session.refreshToken })

      this.auth_response = response.data.data
      this.invokeAuthChange()

      this.authenticateWithRefreshTokens()
      this.authenticateWithAccessTokens()
    } catch (errors) {
      this.logout()
    }
  }

  listen = (fn: (auth?: AuthResponse) => void) => {
    this.on_auth_update = fn
  }

  private invokeAuthChange() {
    if (this.on_auth_update) {
      this.on_auth_update(this.auth_response)
    }
  }

  private setAuthorizationHeader() {
    this.instance.defaults.headers.common = {
      Authorization: `Bearer ${this.auth_response?.accessToken}`
    }
  }

  private authenticateWithAccessTokens() {
    this.setAuthorizationHeader()

    if (!isBrowser()) {
      return
    }

    if (!this.usesAccessTokens()) {
      return
    }

    if (!this.auth_response) {
      return
    }

    const token_expires_at = new Date()

    token_expires_at.setSeconds(
      token_expires_at.getSeconds() + this.auth_response.expiresIn
    )

    this.storage.set<AccessTokenStorageValue>({
      currentTime: new Date().toISOString(),
      expiresIn: this.auth_response.expiresIn,
      accessToken: this.auth_response.accessToken,
      accessTokenExpiresAt: token_expires_at.toISOString()
    })
  }

  private authenticateWithRefreshTokens() {
    this.setAuthorizationHeader()

    if (!this.usesRefreshTokens()) {
      return
    }

    if (!isBrowser()) {
      return
    }

    // if refresh tokens are not turned on on the API:
    if (!this.auth_response?.refreshToken || !this.auth_response?.accessToken) {
      return
    }

    const currentTime = new Date().toISOString()

    this.storage.set<TokenStorageValue>({
      currentTime,
      refreshToken: this.auth_response.refreshToken,
      accessTokenExpiresIn: this.auth_response.expiresIn
    })

    if (this.session_interval) {
      return
    }

    // Trigger a token refresh 10 seconds before the current access token expires.
    this.session_interval = setInterval(() => {
      this.silentLogin()
    }, (this.auth_response.expiresIn - 10) * 1000)
  }

  refreshToken(payload: { token: string }) {
    return this.instance.get('refresh-token', {
      headers: {
        'x-tensei-refresh-token': payload.token
      }
    })
  }

  private isSessionValid(session: AccessTokenStorageValue) {
    const token_expires_at = new Date(session.accessTokenExpiresAt)

    return token_expires_at > new Date()
  }

  isRefreshSessionValid(session: TokenStorageValue) {
    const token_created_at = new Date(session.currentTime)

    token_created_at.setSeconds(
      token_created_at.getSeconds() + session.accessTokenExpiresIn
    )

    return token_created_at > new Date()
  }

  logout() {
    if (this.session_interval) {
      clearInterval(this.session_interval)
    }

    if (isBrowser()) {
      this.storage.clear()
    }

    this.auth_response = undefined
    this.invokeAuthChange()

    delete this.instance.defaults.headers.common['Authorization']
  }

  async register(payload: { object: any; skipAuthentication?: boolean }) {
    const response = await this.instance.post<DataResponse<AuthResponse>>(
      'register',
      payload.object
    )

    this.auth_response = response.data.data
    this.invokeAuthChange()

    if (payload.skipAuthentication) {
      return response
    }

    this.authenticateWithRefreshTokens()
    this.authenticateWithAccessTokens()

    return response
  }

  forgotPassword(payload: { object: ForgotPasswordInput }) {
    return this.instance.post<DataResponse<ForgotPasswordResponse>>(
      'passwords/email',
      payload.object
    )
  }

  resetPassword(payload: { object: ResetPasswordInput }) {
    return this.instance.post('passwords/reset', payload.object)
  }

  async resendVerificationEmail() {
    return this.instance.post('emails/verification/resend')
  }

  async confirmEmail(payload: { object: any }) {
    const response = await this.instance.post(
      'emails/verification/confirm',
      payload.object
    )

    this.updateUser(response.data.data)

    return response
  }

  async enableTwoFactor() {
    const response = await this.instance.post('two-factor/enable')

    this.updateUser(response.data.data)

    return response
  }

  private updateUser(user: any) {
    if (!this.auth_response) {
      return
    }

    const key = this.getUserKey()

    ;(this.auth_response as any)[key] = user[key] ? user[key] : user

    this.invokeAuthChange()
  }

  async confirmEnableTwoFactor(payload: { object: any }) {
    const response = await this.instance.post('two-factor/confirm', {
      token: payload?.object?.token
    })

    this.updateUser(response.data.data)

    return response
  }

  async disableTwoFactor(payload: { object: any }) {
    const response = await this.instance.post('two-factor/disable', {
      token: payload?.object?.token
    })

    this.updateUser(response.data.data)

    return response
  }

  socialRedirectUrl(provider: string) {
    const { protocol, host } = getLocation(this.instance.defaults.baseURL!)!

    return `${protocol}//${host}/connect/${provider}`
  }

  private async handleSocial(type: string, payload: any) {
    let response

    try {
      response = await this.instance.post(`social/${type}`, payload.object)
    } catch (errors) {
      this.logout()

      throw errors
    }

    this.auth_response = response.data.data
    this.invokeAuthChange()

    if (payload.skipAuthentication) {
      return response
    }

    this.setAuthorizationHeader()

    this.authenticateWithRefreshTokens()
    this.authenticateWithAccessTokens()

    return response
  }

  async socialLogin(payload: any) {
    return this.handleSocial('login', this.getSocialPayload(payload))
  }

  async socialRegister(payload: any) {
    return this.handleSocial('register', this.getSocialPayload(payload))
  }

  private getSocialPayload(payload: any) {
    if (!payload?.object) {
      return {
        ...(payload || {}),
        object: {
          accessToken: getUrlParameter('accessToken')
        }
      }
    }

    return payload
  }

  socialConfirm(payload: any) {
    try {
      return this.handleSocial('confirm', this.getSocialPayload(payload))
    } catch (errors) {
      this.logout()

      throw errors
    }
  }
}
