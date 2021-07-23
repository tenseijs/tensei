export interface PermissionConfig {
  slug: string
  default: boolean
  description: string
}

export interface PermissionContract {
  config: PermissionConfig
  slug: (slug: string) => this
  default: () => this
  description: (description: string) => this
}

export class Permission implements PermissionContract {
  config: PermissionConfig = {
    slug: '',
    description: '',
    default: false
  }

  constructor(slug: string, description?: string) {
    ;(this.config.slug = slug), (this.config.description = description || '')
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
}

export const permission = (slug: string, description?: string) =>
  new Permission(slug, description)
