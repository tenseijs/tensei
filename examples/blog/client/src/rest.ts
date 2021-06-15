import * as Tensei from './interfaces'
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export * from './interfaces'

export interface SdkOptions {
  url?: string
  axiosInstance?: AxiosInstance
  axiosRequestConfig?: Omit<AxiosRequestConfig, 'baseURL'>
}

export class Sdk {
  private instance: AxiosInstance
  public posts: PostAPI
  public categories: CategoryAPI
  public customers: CustomerAPI
  public roles: RoleAPI
  public permissions: PermissionAPI

  public auth: AuthAPI

  constructor(private options?: SdkOptions) {
    this.instance =
      options?.axiosInstance ||
      Axios.create({
        baseURL: this.options?.url || 'http://localhost:8810',
        ...(options?.axiosRequestConfig || {}),
      })

    this.auth = new AuthAPI(this.instance)
    this.posts = new PostAPI(this.options, this.instance)
    this.categories = new CategoryAPI(this.options, this.instance)
    this.customers = new CustomerAPI(this.options, this.instance)
    this.roles = new RoleAPI(this.options, this.instance)
    this.permissions = new PermissionAPI(this.options, this.instance)
  }
}

export interface LoginCustomerInput {
  email: string
  password: string
}

export interface RegisterCustomerInput {
  email: string
  categories: Tensei.Category['id'][]
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
  get<T>(): T
  clear: () => void
}

export interface TokenStorageValue {
  access_token_expires_in: number
  refresh_token: string
  current_time: string
}

export interface DataResponse<Response> {
  data: Response
}

export interface AuthResponse {
  customer: Tensei.Customer
  access_token: string
  expires_in: number
  refresh_token: string
}

export type ResetPasswordResponse = true
export type ForgotPasswordResponse = true

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
   * Login an existing customer.
   *      Example:
   *          await tensei.auth.login({
   *              email: 'hey@tenseijs.com',
   *              password: 'password'
   *          })
   *
   **/
  async login(payload: {
    object: LoginCustomerInput
    skipAuthentication?: boolean
  }) {
    const response = await this.instance.post<DataResponse<AuthResponse>>(
      'auth/login',
      payload.object
    )

    this.auth_response = response.data.data

    if (payload.skipAuthentication) {
      return response
    }

    this.authenticateWithRefreshTokens(response.data.data)

    return response
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
         *          await tensei.auth.silentLogin()
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
    if (!isBrowser()) {
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
      console.log(
        '######## @@@@ interval invoked.',
        '--->current_time',
        current_time,
        '--->now',
        new Date().toISOString()
      )
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
    return this.instance.get('auth' + '/refresh-token', {
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
  isSessionValid(session: TokenStorageValue) {
    const token_created_at = new Date(session.current_time)

    token_created_at.setSeconds(token_created_at.getSeconds() + 240)

    return token_created_at > new Date()
  }

  /**
   *
   * Logout a currently logged in customer.
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
   * Register a customer.
   *      Example:
   *          await tensei.auth.register({
   *              email: 'hey@tenseijs.com',
   *              password: 'password'
   *          })
   **/
  async register(payload: {
    object: RegisterCustomerInput
    skipAuthentication?: boolean
  }) {
    const response = await this.instance.post<DataResponse<AuthResponse>>(
      'auth/register',
      payload.object
    )

    this.auth_response = response.data.data

    if (payload.skipAuthentication) {
      return response
    }

    this.authenticateWithRefreshTokens(response.data.data)

    return response
  }

  /**
   *
   * Request a password reset for a customer.
   *      Example:
   *          await tensei.auth.forgotPassword({
   *              email: 'hey@tenseijs.com'
   *          })
   **/
  forgotPassword(payload: { object: ForgotPasswordInput }) {
    return this.instance.post<DataResponse<ForgotPasswordResponse>>(
      'auth/passwords/email',
      payload.object
    )
  }

  /**
   *
   * Reset a password for a customer using a password reset token.
   *      Example:
   *          await tensei.auth.resetPassword({
   *              token: 'b8e9957f3d4e331a821823065c2cde0c32c8b54c',
   *              password: 'new-password'
   *          })
   **/
  resetPassword(payload: { object: ResetPasswordInput }) {
    return this.instance.post<DataResponse<ForgotPasswordResponse>>(
      'auth/passwords/reset',
      payload.object
    )
  }
}

export class PostAPI {
  constructor(private options: SdkOptions, private instance: AxiosInstance) {}

  /**
   *
   * Fetch a single post from the API.
   *    Example:
   *      await tensei.posts().find({ id })
   *
   **/
  find(payload: {
    id: Tensei.Post['id']
    select?: Tensei.PostSelectFields[]
    populate?: Tensei.PostPopulateFields[]
  }) {
    return this.instance.get<Tensei.FindResponse<Tensei.Post>>(
      'api/' + 'posts/' + payload.id
    )
  }

  /**
   *
   * Fetch a paginated list of posts from the API.
   *    Example:
   *      await tensei.posts.findMany({
   *          where: { id: { _in: [1, 2] } },
   *          sort: { id: SortQueryInput.ASC },
   *          pagination: { per_page: 30, page: 1 },
   *      })
   *
   **/
  findMany(
    payload: {
      where?: Tensei.PostWhereQueryInput
      sort?: Tensei.PostSortQueryInput
      pagination?: Tensei.PaginationOptions
      fields?: Tensei.PostSelectFields[]
      populate?: Tensei.PostPopulateFields[]
    } = {}
  ) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Post>>(
      'api/' + 'posts',
      {
        params: {
          populate: payload?.populate?.join(',') || [],
          per_page: payload?.pagination?.per_page,
          page: payload?.pagination?.page,
          fields: payload?.fields?.join(',') || undefined,
          where: payload?.where,
        },
      }
    )
  }

  /**
   *
   * Insert a single post.
   *    Example:
   *      await tensei.posts.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.PostInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Post>>(
      'api/' + 'posts',
      payload.object
    )
  }

  /**
   *
   * Insert multiple posts.
   *    Example:
   *      await tensei.posts.insertMany({ objects: [{...}, {...}] })
   *
   **/
  insertMany(payload: { objects: Tensei.PostInsertInput[] }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Post[]>>(
      'api/' + 'posts/bulk',
      payload
    )
  }

  /**
   *
   * Update a single post.
   *    Example:
   *      await tensei.posts.update({ id: 1, object: {...} })
   *
   **/
  update(payload: { id: Tensei.Post['id']; object: Tensei.PostUpdateInput }) {
    return this.instance.patch<Tensei.FindResponse<Tensei.Post>>(
      'api/' + 'posts/' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple posts.
   *    Example:
   *      await tensei.posts.updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.PostUpdateInput
    where: Tensei.PostWhereQueryInput
  }) {
    return this.instance.patch('api/' + 'posts/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.Post[]>
    >
  }

  /**
   *
   * Delete single posts.
   *    Example:
   *      await tensei.posts.delete({
   *          id: 1
   *      })
   *
   **/
  delete(payload: { id: Tensei.Post['id'] }) {
    return this.instance.delete('api/' + 'posts' + payload.id) as Promise<
      Tensei.FindResponse<Tensei.Post>
    >
  }

  /**
   *
   * Delete multiple posts.
   *    Example:
   *      await tensei.posts.deleteMany({
   *          where: { id: { _in: [1, 2] } },
   *      })
   *
   **/
  deleteMany(payload: { where: Tensei.PostWhereQueryInput }) {
    return this.instance.delete('api/' + 'posts', {
      params: {
        where: payload.where,
      },
    }) as Promise<Tensei.FindResponse<Tensei.Post[]>>
  }
}

export class CategoryAPI {
  constructor(private options: SdkOptions, private instance: AxiosInstance) {}

  /**
   *
   * Fetch a single category from the API.
   *    Example:
   *      await tensei.categories().find({ id })
   *
   **/
  find(payload: {
    id: Tensei.Category['id']
    select?: Tensei.CategorySelectFields[]
    populate?: Tensei.CategoryPopulateFields[]
  }) {
    return this.instance.get<Tensei.FindResponse<Tensei.Category>>(
      'api/' + 'categories/' + payload.id
    )
  }

  /**
   *
   * Fetch a paginated list of categories from the API.
   *    Example:
   *      await tensei.categories.findMany({
   *          where: { id: { _in: [1, 2] } },
   *          sort: { id: SortQueryInput.ASC },
   *          pagination: { per_page: 30, page: 1 },
   *      })
   *
   **/
  findMany(
    payload: {
      where?: Tensei.CategoryWhereQueryInput
      sort?: Tensei.CategorySortQueryInput
      pagination?: Tensei.PaginationOptions
      fields?: Tensei.CategorySelectFields[]
      populate?: Tensei.CategoryPopulateFields[]
    } = {}
  ) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Category>>(
      'api/' + 'categories',
      {
        params: {
          populate: payload?.populate?.join(',') || [],
          per_page: payload?.pagination?.per_page,
          page: payload?.pagination?.page,
          fields: payload?.fields?.join(',') || undefined,
          where: payload?.where,
        },
      }
    )
  }

  /**
   *
   * Insert a single category.
   *    Example:
   *      await tensei.categories.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.CategoryInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Category>>(
      'api/' + 'categories',
      payload.object
    )
  }

  /**
   *
   * Insert multiple categories.
   *    Example:
   *      await tensei.categories.insertMany({ objects: [{...}, {...}] })
   *
   **/
  insertMany(payload: { objects: Tensei.CategoryInsertInput[] }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Category[]>>(
      'api/' + 'categories/bulk',
      payload
    )
  }

  /**
   *
   * Update a single category.
   *    Example:
   *      await tensei.categories.update({ id: 1, object: {...} })
   *
   **/
  update(payload: {
    id: Tensei.Category['id']
    object: Tensei.CategoryUpdateInput
  }) {
    return this.instance.patch<Tensei.FindResponse<Tensei.Category>>(
      'api/' + 'categories/' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple categories.
   *    Example:
   *      await tensei.categories.updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.CategoryUpdateInput
    where: Tensei.CategoryWhereQueryInput
  }) {
    return this.instance.patch('api/' + 'categories/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.Category[]>
    >
  }

  /**
   *
   * Delete single categories.
   *    Example:
   *      await tensei.categories.delete({
   *          id: 1
   *      })
   *
   **/
  delete(payload: { id: Tensei.Category['id'] }) {
    return this.instance.delete('api/' + 'categories' + payload.id) as Promise<
      Tensei.FindResponse<Tensei.Category>
    >
  }

  /**
   *
   * Delete multiple categories.
   *    Example:
   *      await tensei.categories.deleteMany({
   *          where: { id: { _in: [1, 2] } },
   *      })
   *
   **/
  deleteMany(payload: { where: Tensei.CategoryWhereQueryInput }) {
    return this.instance.delete('api/' + 'categories', {
      params: {
        where: payload.where,
      },
    }) as Promise<Tensei.FindResponse<Tensei.Category[]>>
  }
}

export class CustomerAPI {
  constructor(private options: SdkOptions, private instance: AxiosInstance) {}

  /**
   *
   * Insert a single customer.
   *    Example:
   *      await tensei.customers.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.CustomerInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Customer>>(
      'api/' + 'customers',
      payload.object
    )
  }

  /**
   *
   * Insert multiple customers.
   *    Example:
   *      await tensei.customers.insertMany({ objects: [{...}, {...}] })
   *
   **/
  insertMany(payload: { objects: Tensei.CustomerInsertInput[] }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Customer[]>>(
      'api/' + 'customers/bulk',
      payload
    )
  }

  /**
   *
   * Update a single customer.
   *    Example:
   *      await tensei.customers.update({ id: 1, object: {...} })
   *
   **/
  update(payload: {
    id: Tensei.Customer['id']
    object: Tensei.CustomerUpdateInput
  }) {
    return this.instance.patch<Tensei.FindResponse<Tensei.Customer>>(
      'api/' + 'customers/' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple customers.
   *    Example:
   *      await tensei.customers.updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.CustomerUpdateInput
    where: Tensei.CustomerWhereQueryInput
  }) {
    return this.instance.patch('api/' + 'customers/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.Customer[]>
    >
  }
}

export class RoleAPI {
  constructor(private options: SdkOptions, private instance: AxiosInstance) {}

  /**
   *
   * Fetch a single role from the API.
   *    Example:
   *      await tensei.roles().find({ id })
   *
   **/
  find(payload: {
    id: Tensei.Role['id']
    select?: Tensei.RoleSelectFields[]
    populate?: Tensei.RolePopulateFields[]
  }) {
    return this.instance.get<Tensei.FindResponse<Tensei.Role>>(
      'api/' + 'roles/' + payload.id
    )
  }

  /**
   *
   * Fetch a paginated list of roles from the API.
   *    Example:
   *      await tensei.roles.findMany({
   *          where: { id: { _in: [1, 2] } },
   *          sort: { id: SortQueryInput.ASC },
   *          pagination: { per_page: 30, page: 1 },
   *      })
   *
   **/
  findMany(
    payload: {
      where?: Tensei.RoleWhereQueryInput
      sort?: Tensei.RoleSortQueryInput
      pagination?: Tensei.PaginationOptions
      fields?: Tensei.RoleSelectFields[]
      populate?: Tensei.RolePopulateFields[]
    } = {}
  ) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Role>>(
      'api/' + 'roles',
      {
        params: {
          populate: payload?.populate?.join(',') || [],
          per_page: payload?.pagination?.per_page,
          page: payload?.pagination?.page,
          fields: payload?.fields?.join(',') || undefined,
          where: payload?.where,
        },
      }
    )
  }

  /**
   *
   * Insert a single role.
   *    Example:
   *      await tensei.roles.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.RoleInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Role>>(
      'api/' + 'roles',
      payload.object
    )
  }

  /**
   *
   * Insert multiple roles.
   *    Example:
   *      await tensei.roles.insertMany({ objects: [{...}, {...}] })
   *
   **/
  insertMany(payload: { objects: Tensei.RoleInsertInput[] }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Role[]>>(
      'api/' + 'roles/bulk',
      payload
    )
  }

  /**
   *
   * Delete single roles.
   *    Example:
   *      await tensei.roles.delete({
   *          id: 1
   *      })
   *
   **/
  delete(payload: { id: Tensei.Role['id'] }) {
    return this.instance.delete('api/' + 'roles' + payload.id) as Promise<
      Tensei.FindResponse<Tensei.Role>
    >
  }

  /**
   *
   * Delete multiple roles.
   *    Example:
   *      await tensei.roles.deleteMany({
   *          where: { id: { _in: [1, 2] } },
   *      })
   *
   **/
  deleteMany(payload: { where: Tensei.RoleWhereQueryInput }) {
    return this.instance.delete('api/' + 'roles', {
      params: {
        where: payload.where,
      },
    }) as Promise<Tensei.FindResponse<Tensei.Role[]>>
  }
}

export class PermissionAPI {
  constructor(private options: SdkOptions, private instance: AxiosInstance) {}

  /**
   *
   * Fetch a single permission from the API.
   *    Example:
   *      await tensei.permissions().find({ id })
   *
   **/
  find(payload: {
    id: Tensei.Permission['id']
    select?: Tensei.PermissionSelectFields[]
    populate?: Tensei.PermissionPopulateFields[]
  }) {
    return this.instance.get<Tensei.FindResponse<Tensei.Permission>>(
      'api/' + 'permissions/' + payload.id
    )
  }

  /**
   *
   * Fetch a paginated list of permissions from the API.
   *    Example:
   *      await tensei.permissions.findMany({
   *          where: { id: { _in: [1, 2] } },
   *          sort: { id: SortQueryInput.ASC },
   *          pagination: { per_page: 30, page: 1 },
   *      })
   *
   **/
  findMany(
    payload: {
      where?: Tensei.PermissionWhereQueryInput
      sort?: Tensei.PermissionSortQueryInput
      pagination?: Tensei.PaginationOptions
      fields?: Tensei.PermissionSelectFields[]
      populate?: Tensei.PermissionPopulateFields[]
    } = {}
  ) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Permission>>(
      'api/' + 'permissions',
      {
        params: {
          populate: payload?.populate?.join(',') || [],
          per_page: payload?.pagination?.per_page,
          page: payload?.pagination?.page,
          fields: payload?.fields?.join(',') || undefined,
          where: payload?.where,
        },
      }
    )
  }

  /**
   *
   * Insert a single permission.
   *    Example:
   *      await tensei.permissions.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.PermissionInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Permission>>(
      'api/' + 'permissions',
      payload.object
    )
  }

  /**
   *
   * Insert multiple permissions.
   *    Example:
   *      await tensei.permissions.insertMany({ objects: [{...}, {...}] })
   *
   **/
  insertMany(payload: { objects: Tensei.PermissionInsertInput[] }) {
    return this.instance.post<Tensei.FindResponse<Tensei.Permission[]>>(
      'api/' + 'permissions/bulk',
      payload
    )
  }
}
