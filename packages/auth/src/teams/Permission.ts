import { paramCase } from 'change-case'

export interface PermissionConfig {
  slug: string
  name: string
  default: boolean
  description: string
}

export interface RoleConfig {
  slug: string
  name: string
  default: boolean
  description: string
  permissions: PermissionContract[]
}

export interface PermissionContract {
  config: PermissionConfig
  slug: (slug: string) => this
  default: () => this
  description: (description: string) => this
  formatForEnum: () => string
}

export interface RoleContract {
  config: RoleConfig
  default: () => this
  slug: (slug: string) => this
  formatForEnum: () => string
  description: (description: string) => this
  permissions: (permissions: PermissionContract[]) => this
}

export class Role implements RoleContract {
  config: RoleConfig = {
    slug: '',
    name: '',
    description: '',
    default: false,
    permissions: []
  }

  constructor(name: string, description?: string) {
    this.config = {
      ...this.config,
      name,
      slug: paramCase(name),
      description: description || ''
    }
  }

  description(description: string) {
    this.config.description = description

    return this
  }

  default() {
    this.config.default = true

    return this
  }

  slug(slug: string) {
    this.config.slug = slug

    return this
  }

  permissions(permissions: PermissionContract[]) {
    this.config.permissions = permissions

    return this
  }

  formatForEnum() {
    return this.config.slug
      .split(':')
      .join('_')
      .split('-')
      .join('_')
      .toUpperCase()
  }
}

export class Permission implements PermissionContract {
  config: PermissionConfig = {
    name: '',
    slug: '',
    description: '',
    default: false
  }

  constructor(name: string, description?: string) {
    this.config = {
      ...this.config,
      name,
      slug: paramCase(name),
      description: description || ''
    }
  }

  description(description: string) {
    this.config.description = description

    return this
  }

  default() {
    this.config.default = true

    return this
  }

  slug(slug: string) {
    this.config.slug = slug

    return this
  }

  formatForEnum() {
    return this.config.slug.split('-').join('_').toUpperCase()
  }

  static formatToSlug(slug: string) {
    return slug.toLowerCase().split('_').join('-')
  }
}

export const permission = (slug: string, description?: string) =>
  new Permission(slug, description)

export const role = (slug: string, description?: string) =>
  new Role(slug, description)
