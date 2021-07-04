import { sentenceCase } from 'change-case'
import { EntityManager } from '@mikro-orm/core'
import { ResourceContract, Permission, PluginSetupConfig } from '@tensei/common'

export const setupCms = async (
  config: PluginSetupConfig,
  [RoleResource, PermissionResource]: ResourceContract[]
) => {
  const { resources, orm } = config

  const { em } = orm!

  const insertPermissions = await getPermissionsToInsert(
    resources,
    em,
    PermissionResource
  )

  if (insertPermissions.length > 0) {
    await em.persistAndFlush(
      insertPermissions.map(permission =>
        em.create(PermissionResource.data.pascalCaseName, permission)
      )
    )
  }

  // Insert default super admin role
  let superAdminRole: any = await em.findOne(RoleResource.data.pascalCaseName, {
    slug: 'super-admin'
  })

  const allPermissions = (
    await em.find(PermissionResource.data.pascalCaseName, {})
  ).map((permission: any) => permission.id)

  if (superAdminRole) {
    em.assign(superAdminRole, {
      admin_permissions: allPermissions
    })
  }

  await em.persistAndFlush(
    superAdminRole ||
      em.create(RoleResource.data.pascalCaseName, {
        name: 'Super Admin',
        slug: 'super-admin',
        admin_permissions: allPermissions
      })
  )
}

export const setup = async (
  config: PluginSetupConfig,
  [RoleResource, PermissionResource]: ResourceContract[]
) => {
  const { resources, orm } = config

  const { em } = orm!

  const insertPermissions = await getPermissionsToInsert(
    resources,
    em,
    PermissionResource
  )

  if (insertPermissions.length > 0) {
    await em.persistAndFlush(
      insertPermissions.map(permission =>
        em.create(PermissionResource.data.pascalCaseName, permission)
      )
    )
  }

  // Insert default roles
  // There will be two default roles: Authenticated & Public
  // Public will have no permissions attached by default
  let [authenticatedRole, publicRole] = await em.find(
    RoleResource.data.pascalCaseName,
    {
      slug: {
        $in: ['authenticated', 'public']
      }
    },
    {
      orderBy: {
        slug: 'ASC'
      }
    }
  )

  const rolesToCreate = []
  const allPermissions = (
    await em.find(PermissionResource.data.pascalCaseName, {})
  ).map((permission: any) => permission.id)

  if (!authenticatedRole) {
    rolesToCreate.push({
      name: 'Authenticated',
      slug: 'authenticated',
      permissions: allPermissions
    })
  }

  if (!publicRole) {
    rolesToCreate.push({
      name: 'Public',
      slug: 'public',
      permissions: allPermissions
    })
  }

  await em.persistAndFlush(
    rolesToCreate.map(role => em.create(RoleResource.data.pascalCaseName, role))
  )
}

const getPermissionsToInsert = async (
  resources: ResourceContract[],
  em: EntityManager,
  permissionResource: ResourceContract
) => {
  const permissions: Permission[] = []

  resources
    .filter(resource => !resource.data.hideOnApi)
    .forEach(resource => {
      ;['insert', 'index', 'show', 'update', 'delete'].forEach(operation => {
        permissions.push(`${operation}:${resource.data.slug}`)
      })

      resource.data.actions.forEach(action => {
        permissions.push(`run:${resource.data.slug}:${action.data.slug}`)
      })

      resource.data.permissions.forEach(permission => {
        permissions.push(permission)
      })
    })

  const existingPermissions: any[] = (
    await em.find(permissionResource.data.pascalCaseName, {
      slug: {
        $in: permissions
      }
    })
  ).map(permission => permission.slug)

  const newPermissionsToCreate = permissions.filter(
    permission =>
      !existingPermissions.includes(
        typeof permission === 'string' ? permission : permission.slug
      )
  )

  return Array.from(new Set(newPermissionsToCreate)).map(permission => ({
    name:
      typeof permission === 'string'
        ? sentenceCase(permission.split(':').join(' '))
        : permission.name,
    slug: permission
  }))
}
