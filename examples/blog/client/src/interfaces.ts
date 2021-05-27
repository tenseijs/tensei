/**
 *
 * Type definitions for the Post resource.
 *
 **/
export interface Post {
  id: number
  created_at: DateString
  updated_at: DateString
  title: string
  slug: string
  description: string
  content: string
  published_at: DateString
  category: Category["id"]
  procedure: string[]
  prices: number[]
}

export interface PostWhereQueryInput {
  _and: PostWhereQueryInput[]
  _or: PostWhereQueryInput[]
  _not: PostWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  title: StringWhereQueryInput
  slug: StringWhereQueryInput
  published_at: DateWhereQueryInput
}

export interface PostInsertInput {
  title: string
  slug?: string
  description: string
  content?: string
  published_at: DateString
  category?: Category["id"]
  procedure: string[]
  prices: number[]
}

export interface PostUpdateInput {
  title: string
  slug?: string
  description: string
  content?: string
  published_at: DateString
  category?: Category["id"]
  procedure: string[]
  prices: number[]
}

export interface PostSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Category resource.
 *
 **/
export interface Category {
  id: number
  created_at: DateString
  updated_at: DateString
  name: string
  description: string
  user: User["id"]
  posts: Post["id"][]
}

export interface CategoryWhereQueryInput {
  _and: CategoryWhereQueryInput[]
  _or: CategoryWhereQueryInput[]
  _not: CategoryWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  name: StringWhereQueryInput
}

export interface CategoryInsertInput {
  name: string
  description?: string
  user?: User["id"]
  posts?: Post["id"][]
}

export interface CategoryUpdateInput {
  name: string
  description?: string
  user?: User["id"]
  posts?: Post["id"][]
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
  id: number
  created_at: DateString
  updated_at: DateString
  full_name: string
  email: string
  active: boolean
  admin_roles: AdminRole["id"][]
}

export interface AdminUserWhereQueryInput {
  _and: AdminUserWhereQueryInput[]
  _or: AdminUserWhereQueryInput[]
  _not: AdminUserWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  full_name: StringWhereQueryInput
  email: StringWhereQueryInput
  active: StringWhereQueryInput
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
  id: number
  created_at: DateString
  updated_at: DateString
  name: string
  slug: string
  description: string
  admin_users: AdminUser["id"][]
  admin_permissions: AdminPermission["id"][]
}

export interface AdminRoleWhereQueryInput {
  _and: AdminRoleWhereQueryInput[]
  _or: AdminRoleWhereQueryInput[]
  _not: AdminRoleWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  name: StringWhereQueryInput
  slug: StringWhereQueryInput
  description: StringWhereQueryInput
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
  id: number
  created_at: DateString
  updated_at: DateString
  type: string
  token: string
  expires_at: DateString
  admin_user: AdminUser["id"]
}

export interface AdminTokenWhereQueryInput {
  _and: AdminTokenWhereQueryInput[]
  _or: AdminTokenWhereQueryInput[]
  _not: AdminTokenWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  type: StringWhereQueryInput
  token: StringWhereQueryInput
  expires_at: DateWhereQueryInput
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
  id: number
  created_at: DateString
  updated_at: DateString
  name: string
  slug: string
  admin_roles: AdminRole["id"][]
}

export interface AdminPermissionWhereQueryInput {
  _and: AdminPermissionWhereQueryInput[]
  _or: AdminPermissionWhereQueryInput[]
  _not: AdminPermissionWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  name: StringWhereQueryInput
  slug: StringWhereQueryInput
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
  id: number
  created_at: DateString
  updated_at: DateString
  email: string
  password: string
  blocked: boolean
  roles: Role["id"][]
}

export interface UserWhereQueryInput {
  _and: UserWhereQueryInput[]
  _or: UserWhereQueryInput[]
  _not: UserWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  email: StringWhereQueryInput
}

export interface UserInsertInput {
  email?: string
}

export interface UserUpdateInput {
  email?: string
  roles?: Role["id"][]
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
  id: number
  created_at: DateString
  updated_at: DateString
  email: string
  token: string
  expires_at: DateString
}

export interface PasswordResetWhereQueryInput {
  _and: PasswordResetWhereQueryInput[]
  _or: PasswordResetWhereQueryInput[]
  _not: PasswordResetWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  email: StringWhereQueryInput
  expires_at: DateWhereQueryInput
}

export interface PasswordResetSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Role resource.
 *
 **/
export interface Role {
  id: number
  created_at: DateString
  updated_at: DateString
  name: string
  slug: string
  users: User["id"][]
  permissions: Permission["id"][]
}

export interface RoleWhereQueryInput {
  _and: RoleWhereQueryInput[]
  _or: RoleWhereQueryInput[]
  _not: RoleWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  name: StringWhereQueryInput
  slug: StringWhereQueryInput
}

export interface RoleInsertInput {
  name: string
  slug: string
  users?: User["id"][]
  permissions?: Permission["id"][]
}

export interface RoleSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Permission resource.
 *
 **/
export interface Permission {
  id: number
  created_at: DateString
  updated_at: DateString
  name: string
  slug: string
  roles: Role["id"][]
}

export interface PermissionWhereQueryInput {
  _and: PermissionWhereQueryInput[]
  _or: PermissionWhereQueryInput[]
  _not: PermissionWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  name: StringWhereQueryInput
  slug: StringWhereQueryInput
}

export interface PermissionInsertInput {
  name: string
  slug: string
  roles?: Role["id"][]
}

export interface PermissionSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

/**
 *
 * Type definitions for the Token resource.
 *
 **/
export interface Token {
  id: number
  created_at: DateString
  updated_at: DateString
  token: string
  name: string
  type: string
  last_used_at: DateString
  compromised_at: DateString
  expires_at: DateString
  user: User["id"]
}

export interface TokenWhereQueryInput {
  _and: TokenWhereQueryInput[]
  _or: TokenWhereQueryInput[]
  _not: TokenWhereQueryInput
  id: IDWhereQueryInput
  created_at: DateWhereQueryInput
  updated_at: DateWhereQueryInput
  name: StringWhereQueryInput
  type: StringWhereQueryInput
  last_used_at: DateWhereQueryInput
  compromised_at: DateWhereQueryInput
}

export interface TokenSortQueryInput {
  created_at: SortQueryInput
  updated_at: SortQueryInput
}

export type DateString = string
export type Decimal = number
export type ID = number
export enum SortQueryInput {
  ASC = "asc",
  ASC_NULLS_LAST = "asc_nulls_last",
  ASC_NULLS_FIRST = "asc_nulls_first",
  DESC = "desc",
  DESC_NULLS_LAST = "desc_nulls_last",
  DESC_NULLS_FIRST = "desc_nulls_first",
}

export interface StringWhereQueryInput {
  _eq: string
  _ne: string
  _in: string[]
  _nin: string[]
  _gt: string
  _gte: string
  _lt: string
  _lte: string
  _like: string
  _re: string
  _ilike: string
  _overlap: string
  _contains: string
  _contained: string
}

export interface NumberWhereQueryInput {
  _eq: number
  _ne: number
  _in: number[]
  _nin: number[]
  _gt: number
  _gte: number
  _lt: number
  _lte: number
  _like: number
  _re: number
  _ilike: number
  _overlap: number
  _contains: number
  _contained: number
}

export interface IDWhereQueryInput {
  _eq: ID
  _ne: ID
  _in: ID[]
  _nin: ID[]
  _gt: ID
  _gte: ID
  _lt: ID
  _lte: ID
  _like: ID
  _re: ID
  _ilike: ID
  _overlap: ID
  _contains: ID
  _contained: ID
}

export interface DateWhereQueryInput {
  _eq: DateString
  _ne: DateString
  _in: DateString[]
  _nin: DateString[]
  _gt: DateString
  _gte: DateString
  _lt: DateString
  _lte: DateString
  _like: DateString
  _re: DateString
  _ilike: DateString
  _overlap: DateString
  _contains: DateString
  _contained: DateString
}
