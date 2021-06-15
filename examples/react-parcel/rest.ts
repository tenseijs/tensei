import * as Qs from 'qs'
import { Tensei } from './interfaces'
import Axios, { AxiosInstance } from 'axios'

export class BaseAPI {
  toQueryString(payload: any) {
    return Qs.stringify(payload, {
      encodeValuesOnly: true,
    })
  }
}

export interface TenseiClientOptions {
  url: string
}

export class TenseiClient {
  private instance: any
  public posts: PostAPI
  public categories: CategoryAPI
  public users: UserAPI
  public roles: RoleAPI
  public permissions: PermissionAPI

  constructor(private options: TenseiClientOptions) {
    this.instance = Axios.create({
      baseURL: this.options.url,
    })

    this.posts = new PostAPI(this.options, this.instance)
    this.categories = new CategoryAPI(this.options, this.instance)
    this.users = new UserAPI(this.options, this.instance)
    this.roles = new RoleAPI(this.options, this.instance)
    this.permissions = new PermissionAPI(this.options, this.instance)
  }
}

export class PostAPI extends BaseAPI {
  constructor(
    private options: TenseiClientOptions,
    private instance: AxiosInstance
  ) {
    super()
  }

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
      'posts/' + payload.id
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
  findMany(payload: {
    where?: Tensei.PostWhereQueryInput
    sort?: Tensei.PostSortQueryInput
    pagination?: Tensei.PaginationOptions
    select?: Tensei.PostSelectFields[]
    populate?: Tensei.PostPopulateFields[]
  }) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Post>>('posts', {
      params: {
        populate: payload.populate?.join(',') || [],
        per_page: payload?.pagination?.per_page,
        page: payload?.pagination?.page,
        select: payload.select?.join(',') || undefined,
      },
    })
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
      'posts',
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
      'posts/bulk',
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
      'posts' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple posts.
   *    Example:
   *      await tensei.posts().updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.PostUpdateInput
    where: Tensei.PostWhereQueryInput
  }) {
    return this.instance.patch('posts/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.Post[]>
    >
  }

  /**
   *
   * Delete single posts.
   *    Example:
   *      await tensei.posts().delete({
   *          id: 1
   *      })
   *
   **/
  delete(payload: { id: Tensei.Post['id'] }) {
    return this.instance.delete('posts' + payload.id) as Promise<
      Tensei.FindResponse<Tensei.Post>
    >
  }

  /**
   *
   * Delete multiple posts.
   *    Example:
   *      await tensei.posts().deleteMany({
   *          where: { id: { _in: [1, 2] } },
   *      })
   *
   **/
  deleteMany(payload: { where: Tensei.PostWhereQueryInput }) {
    return this.instance.delete('posts', payload.where) as Promise<
      Tensei.FindResponse<Tensei.Post[]>
    >
  }
}

export class CategoryAPI extends BaseAPI {
  constructor(
    private options: TenseiClientOptions,
    private instance: AxiosInstance
  ) {
    super()
  }

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
      'categories/' + payload.id
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
  findMany(payload: {
    where?: Tensei.CategoryWhereQueryInput
    sort?: Tensei.CategorySortQueryInput
    pagination?: Tensei.PaginationOptions
    select?: Tensei.CategorySelectFields[]
    populate?: Tensei.CategoryPopulateFields[]
  }) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Category>>(
      'categories',
      {
        params: {
          populate: payload.populate?.join(',') || [],
          per_page: payload?.pagination?.per_page,
          page: payload?.pagination?.page,
          select: payload.select?.join(',') || undefined,
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
      'categories',
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
      'categories/bulk',
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
      'categories' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple categories.
   *    Example:
   *      await tensei.categories().updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.CategoryUpdateInput
    where: Tensei.CategoryWhereQueryInput
  }) {
    return this.instance.patch('categories/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.Category[]>
    >
  }

  /**
   *
   * Delete single categories.
   *    Example:
   *      await tensei.categories().delete({
   *          id: 1
   *      })
   *
   **/
  delete(payload: { id: Tensei.Category['id'] }) {
    return this.instance.delete('categories' + payload.id) as Promise<
      Tensei.FindResponse<Tensei.Category>
    >
  }

  /**
   *
   * Delete multiple categories.
   *    Example:
   *      await tensei.categories().deleteMany({
   *          where: { id: { _in: [1, 2] } },
   *      })
   *
   **/
  deleteMany(payload: { where: Tensei.CategoryWhereQueryInput }) {
    return this.instance.delete('categories', payload.where) as Promise<
      Tensei.FindResponse<Tensei.Category[]>
    >
  }
}

export class UserAPI extends BaseAPI {
  constructor(
    private options: TenseiClientOptions,
    private instance: AxiosInstance
  ) {
    super()
  }

  /**
   *
   * Insert a single user.
   *    Example:
   *      await tensei.users.insert({ object: {...} })
   *
   **/
  insert(payload: { object: Tensei.UserInsertInput }) {
    return this.instance.post<Tensei.FindResponse<Tensei.User>>(
      'users',
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
      'users/bulk',
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
      'users' + payload.id,
      payload.object
    )
  }

  /**
   *
   * Update multiple users.
   *    Example:
   *      await tensei.users().updateMany({
   *          where: { id: { _in: [1, 2] } },
   *          object: {...},
   *      })
   *
   **/
  updateMany(payload: {
    object: Tensei.UserUpdateInput
    where: Tensei.UserWhereQueryInput
  }) {
    return this.instance.patch('users/bulk', payload) as Promise<
      Tensei.FindResponse<Tensei.User[]>
    >
  }
}

export class RoleAPI extends BaseAPI {
  constructor(
    private options: TenseiClientOptions,
    private instance: AxiosInstance
  ) {
    super()
  }

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
      'roles/' + payload.id
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
  findMany(payload: {
    where?: Tensei.RoleWhereQueryInput
    sort?: Tensei.RoleSortQueryInput
    pagination?: Tensei.PaginationOptions
    select?: Tensei.RoleSelectFields[]
    populate?: Tensei.RolePopulateFields[]
  }) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Role>>('roles', {
      params: {
        populate: payload.populate?.join(',') || [],
        per_page: payload?.pagination?.per_page,
        page: payload?.pagination?.page,
        select: payload.select?.join(',') || undefined,
      },
    })
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
      'roles',
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
      'roles/bulk',
      payload
    )
  }

  /**
   *
   * Delete single roles.
   *    Example:
   *      await tensei.roles().delete({
   *          id: 1
   *      })
   *
   **/
  delete(payload: { id: Tensei.Role['id'] }) {
    return this.instance.delete('roles' + payload.id) as Promise<
      Tensei.FindResponse<Tensei.Role>
    >
  }

  /**
   *
   * Delete multiple roles.
   *    Example:
   *      await tensei.roles().deleteMany({
   *          where: { id: { _in: [1, 2] } },
   *      })
   *
   **/
  deleteMany(payload: { where: Tensei.RoleWhereQueryInput }) {
    return this.instance.delete('roles', payload.where) as Promise<
      Tensei.FindResponse<Tensei.Role[]>
    >
  }
}

export class PermissionAPI extends BaseAPI {
  constructor(
    private options: TenseiClientOptions,
    private instance: AxiosInstance
  ) {
    super()
  }

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
      'permissions/' + payload.id
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
  findMany(payload: {
    where?: Tensei.PermissionWhereQueryInput
    sort?: Tensei.PermissionSortQueryInput
    pagination?: Tensei.PaginationOptions
    select?: Tensei.PermissionSelectFields[]
    populate?: Tensei.PermissionPopulateFields[]
  }) {
    return this.instance.get<Tensei.PaginatedResponse<Tensei.Permission>>(
      'permissions',
      {
        params: {
          populate: payload.populate?.join(',') || [],
          per_page: payload?.pagination?.per_page,
          page: payload?.pagination?.page,
          select: payload.select?.join(',') || undefined,
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
      'permissions',
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
      'permissions/bulk',
      payload
    )
  }
}
