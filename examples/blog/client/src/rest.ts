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
  public users: UserAPI

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
    this.users = new UserAPI(this.options, this.instance)
  }
}

export interface LoginUserInput {
  email: string
  password: string
}

export interface RegisterUserInput {
  email: string
  two_factor_enabled: boolean
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
  user: Tensei.User
  access_token: string
  expires_in: number
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
   * Login an existing user.
   *      Example:
   *          await tensei.auth.login({
   *              email: 'hey@tenseijs.com',
   *              password: 'password'
   *          })
   *
   **/
  async login(payload: {
    object: LoginUserInput
    skipAuthentication?: boolean
  }) {
    const response = await this.instance.post<DataResponse<AuthResponse>>(
      'api/login',
      payload.object
    )

    this.auth_response = response.data.data

    if (payload.skipAuthentication) {
      return response
    }

    return response
  }

  /**
         * 
         * Fetch the authenticated user details.
         * 
         **
        me() {
            return this.instance.get<DataResponse<AuthResponse>>('api/me')
        }

        

        /**
         * 
         * Logout a currently logged in user.
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
   * Register a user.
   *      Example:
   *          await tensei.auth.register({
   *              email: 'hey@tenseijs.com',
   *              password: 'password'
   *          })
   **/
  async register(payload: {
    object: RegisterUserInput
    skipAuthentication?: boolean
  }) {
    const response = await this.instance.post<DataResponse<AuthResponse>>(
      'api/register',
      payload.object
    )

    this.auth_response = response.data.data

    if (payload.skipAuthentication) {
      return response
    }

    return response
  }

  /**
   *
   * Request a password reset for a user.
   *      Example:
   *          await tensei.auth.forgotPassword({
   *              email: 'hey@tenseijs.com'
   *          })
   **/
  forgotPassword(payload: { object: ForgotPasswordInput }) {
    return this.instance.post<DataResponse<ForgotPasswordResponse>>(
      'api/passwords/email',
      payload.object
    )
  }

  /**
   *
   * Reset a password for a user using a password reset token.
   *      Example:
   *          await tensei.auth.resetPassword({
   *              token: 'b8e9957f3d4e331a821823065c2cde0c32c8b54c',
   *              password: 'new-password'
   *          })
   **/
  resetPassword(payload: { object: ResetPasswordInput }) {
    return this.instance.post<DataResponse<ForgotPasswordResponse>>(
      'api/passwords/reset',
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

export class UserAPI {
  constructor(private options: SdkOptions, private instance: AxiosInstance) {}

  /**
   *
   * Insert a single user.
   *    Example:
   *      await tensei.users.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.UserInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.User>>(
      'api/' + 'users',
      payload.object
    )
  }

  /**
   *
   * Insert multiple users.
   *    Example:
   *      await tensei.users.insertMany({ objects: [{...}, {...}] })
   *
   **/
  insertMany(payload: { objects: Tensei.UserInsertInput[] }) {
    return this.instance.post<Tensei.FindResponse<Tensei.User[]>>(
      'api/' + 'users/bulk',
      payload
    )
  }

  /**
   *
   * Update a single user.
   *    Example:
   *      await tensei.users.update({ id: 1, object: {...} })
   *
   **/
  update(payload: { id: Tensei.User['id']; object: Tensei.UserUpdateInput }) {
    return this.instance.patch<Tensei.FindResponse<Tensei.User>>(
      'api/' + 'users/' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple users.
   *    Example:
   *      await tensei.users.updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.UserUpdateInput
    where: Tensei.UserWhereQueryInput
  }) {
    return this.instance.patch('api/' + 'users/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.User[]>
    >
  }
}
