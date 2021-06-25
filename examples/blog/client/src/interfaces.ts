export type PostPopulateFields = 'category' | 'category.user' | 'category.posts'

export type PostSelectFields =
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'slug'
  | 'description'
  | 'content'
  | 'published_at'
  | 'category'
  | 'procedure'
  | 'prices'

/**
 *
 * Type definitions for the Post resource.
 *
 **/
export interface Post {
  id: string
  created_at: DateString
  updated_at: DateString
  title: string
  slug: string
  description: string
  content: string
  published_at: DateString
  category: Category['id']
  procedure: string[]
  prices: number[]
}

export interface PostWhereQueryInput {
  _and?: PostWhereQueryInput[]
  _or?: PostWhereQueryInput[]
  _not?: PostWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  title?: StringWhereQueryInput
  slug?: StringWhereQueryInput
  published_at?: DateWhereQueryInput
}

export interface PostInsertInput {
  title: string
  slug?: string
  description?: string
  content: string
  published_at?: DateString
  category?: Category['id']
  procedure?: string[]
  prices?: number[]
}

export interface PostUpdateInput {
  title: string
  slug?: string
  description?: string
  content: string
  published_at?: DateString
  category?: Category['id']
  procedure?: string[]
  prices?: number[]
}

export interface PostSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

export type CategoryPopulateFields =
  | 'user'
  | 'user.oauth_identities'
  | 'user.categories'
  | 'posts'
  | 'posts.category'

export type CategorySelectFields =
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'name'
  | 'description'
  | 'user'
  | 'posts'

/**
 *
 * Type definitions for the Category resource.
 *
 **/
export interface Category {
  id: string
  created_at: DateString
  updated_at: DateString
  name: string
  description: string
  user: User['id']
  posts: Post['id'][]
}

export interface CategoryWhereQueryInput {
  _and?: CategoryWhereQueryInput[]
  _or?: CategoryWhereQueryInput[]
  _not?: CategoryWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  name?: StringWhereQueryInput
}

export interface CategoryInsertInput {
  name: string
  description?: string
  user?: User['id']
  posts?: Post['id'][]
}

export interface CategoryUpdateInput {
  name: string
  description?: string
  user?: User['id']
  posts?: Post['id'][]
}

export interface CategorySortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Admin User resource.
 *
 **/
export interface AdminUser {
  id: string
  created_at: DateString
  updated_at: DateString
  full_name: string
  email: string
  active: boolean
  admin_roles: AdminRole['id'][]
}

export interface AdminUserWhereQueryInput {
  _and?: AdminUserWhereQueryInput[]
  _or?: AdminUserWhereQueryInput[]
  _not?: AdminUserWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  full_name?: StringWhereQueryInput
  email?: StringWhereQueryInput
  active?: StringWhereQueryInput
}

export interface AdminUserSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
  full_name: SortQueryInput
  email: SortQueryInput
  active: SortQueryInput
}

/**
 *
 * Type definitions for the Admin Role resource.
 *
 **/
export interface AdminRole {
  id: string
  created_at: DateString
  updated_at: DateString
  name: string
  slug: string
  description: string
  admin_users: AdminUser['id'][]
  admin_permissions: AdminPermission['id'][]
}

export interface AdminRoleWhereQueryInput {
  _and?: AdminRoleWhereQueryInput[]
  _or?: AdminRoleWhereQueryInput[]
  _not?: AdminRoleWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  name?: StringWhereQueryInput
  slug?: StringWhereQueryInput
  description?: StringWhereQueryInput
}

export interface AdminRoleSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
  name: SortQueryInput
  slug: SortQueryInput
}

/**
 *
 * Type definitions for the Admin Token resource.
 *
 **/
export interface AdminToken {
  id: string
  created_at: DateString
  updated_at: DateString
  type: string
  token: string
  expires_at: DateString
  admin_user: AdminUser['id']
}

export interface AdminTokenWhereQueryInput {
  _and?: AdminTokenWhereQueryInput[]
  _or?: AdminTokenWhereQueryInput[]
  _not?: AdminTokenWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  type?: StringWhereQueryInput
  token?: StringWhereQueryInput
  expires_at?: DateWhereQueryInput
}

export interface AdminTokenSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Admin Permission resource.
 *
 **/
export interface AdminPermission {
  id: string
  created_at: DateString
  updated_at: DateString
  name: string
  slug: string
  admin_roles: AdminRole['id'][]
}

export interface AdminPermissionWhereQueryInput {
  _and?: AdminPermissionWhereQueryInput[]
  _or?: AdminPermissionWhereQueryInput[]
  _not?: AdminPermissionWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  name?: StringWhereQueryInput
  slug?: StringWhereQueryInput
}

export interface AdminPermissionSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the User resource.
 *
 **/
export interface User {
  id: string
  created_at: DateString
  updated_at: DateString
  email: string
  password: string
  blocked: boolean
  oauth_identities: OauthIdentity['id'][]
  two_factor_enabled: boolean
  two_factor_secret: string
  email_verified_at: DateString
  email_verification_token: string
  categories: Category['id'][]
  accepted_terms_and_conditions: boolean
}

export interface UserWhereQueryInput {
  _and?: UserWhereQueryInput[]
  _or?: UserWhereQueryInput[]
  _not?: UserWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  email?: StringWhereQueryInput
  two_factor_enabled?: StringWhereQueryInput
  email_verified_at?: DateWhereQueryInput
  accepted_terms_and_conditions?: StringWhereQueryInput
}

export interface UserInsertInput {
  email?: string
  two_factor_enabled?: boolean
  categories?: Category['id'][]
  accepted_terms_and_conditions: boolean
}

export interface UserUpdateInput {
  email?: string
  two_factor_enabled?: boolean
  categories?: Category['id'][]
  accepted_terms_and_conditions: boolean
}

export interface UserSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Password Reset resource.
 *
 **/
export interface PasswordReset {
  id: string
  created_at: DateString
  updated_at: DateString
  email: string
  token: string
  expires_at: DateString
}

export interface PasswordResetWhereQueryInput {
  _and?: PasswordResetWhereQueryInput[]
  _or?: PasswordResetWhereQueryInput[]
  _not?: PasswordResetWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  email?: StringWhereQueryInput
  expires_at?: DateWhereQueryInput
}

export interface PasswordResetSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Oauth Identity resource.
 *
 **/
export interface OauthIdentity {
  id: string
  created_at: DateString
  updated_at: DateString
  user: User['id']
  access_token: string
  email: string
  temporal_token: string
  payload: string
  provider: string
  provider_user_id: string
}

export interface OauthIdentityWhereQueryInput {
  _and?: OauthIdentityWhereQueryInput[]
  _or?: OauthIdentityWhereQueryInput[]
  _not?: OauthIdentityWhereQueryInput
  id?: IDWhereQueryInput
  created_at?: DateWhereQueryInput
  updated_at?: DateWhereQueryInput
  provider?: StringWhereQueryInput
}

export interface OauthIdentitySortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

export type DateString = string
export type Decimal = number
export type ID = number
export enum SortQueryInput {
  ASC = 'asc',
  ASC_NULLS_LAST = 'asc_nulls_last',
  ASC_NULLS_FIRST = 'asc_nulls_first',
  DESC = 'desc',
  DESC_NULLS_LAST = 'desc_nulls_last',
  DESC_NULLS_FIRST = 'desc_nulls_first',
}
export interface PaginationOptions {
  page: number
  per_page: number
}

export interface FindResponse<Resource> {
  data: Resource
}

export interface PaginatedResponse<Resource> {
  data: Resource[]
  meta: {
    total: number
    page: number
    per_page: number
    page_count: number
  }
}

export interface StringWhereQueryInput {
  _eq?: string
  _ne?: string
  _in?: string[]
  _nin?: string[]
  _gt?: string
  _gte?: string
  _lt?: string
  _lte?: string
  _like?: string
  _re?: string
  _ilike?: string
  _overlap?: string
  _contains?: string
  _contained?: string
}

export interface NumberWhereQueryInput {
  _eq?: number
  _ne?: number
  _in?: number[]
  _nin?: number[]
  _gt?: number
  _gte?: number
  _lt?: number
  _lte?: number
  _like?: number
  _re?: number
  _ilike?: number
  _overlap?: number
  _contains?: number
  _contained?: number
}

export interface IDWhereQueryInput {
  _eq?: ID
  _ne?: ID
  _in?: ID[]
  _nin?: ID[]
  _gt?: ID
  _gte?: ID
  _lt?: ID
  _lte?: ID
  _like?: ID
  _re?: ID
  _ilike?: ID
  _overlap?: ID
  _contains?: ID
  _contained?: ID
}

export interface DateWhereQueryInput {
  _eq?: DateString
  _ne?: DateString
  _in?: DateString[]
  _nin?: DateString[]
  _gt?: DateString
  _gte?: DateString
  _lt?: DateString
  _lte?: DateString
  _like?: DateString
  _re?: DateString
  _ilike?: DateString
  _overlap?: DateString
  _contains?: DateString
  _contained?: DateString
}
