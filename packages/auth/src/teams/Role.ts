export interface RoleConfig {
  permissions: string[]
  slug: string
  name: string
  description: string
}

export interface RoleContract {
  slug: (slug: string) => this
  description: (description: string) => this
  permissions: (permissions: string[]) => this
}

export class Role implements RoleContract {
  config: RoleConfig = {
    slug: '',
    name: '',
    description: '',
    permissions: []
  }

  constructor(name: string) {
    this.config.name = name
  }

  permissions(permissions: string[]) {
    this.config.permissions = permissions

    return this
  }

  description(description: string) {
    this.config.description = description

    return this
  }

  slug(slug: string) {
    this.config.slug = slug

    return this
  }
}

export const role = (name: string) => new Role(name)
