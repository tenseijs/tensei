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

  if (!superAdminRole) {
    superAdminRole = em.create(RoleResource.data.pascalCaseName, {
      name: 'Super Admin',
      slug: 'super-admin',
      description:
        'Manage the access and level of responsibility of all users on this network.',
      adminPermissions: allPermissions
    })
  }

  if (superAdminRole) {
    em.assign(superAdminRole, {
      adminPermissions: allPermissions
    })
  }

  await em.persistAndFlush(superAdminRole)
}

const getPermissionsToInsert = async (
  resources: ResourceContract[],
  em: EntityManager,
  permissionResource: ResourceContract
) => {
  const permissions: Permission[] = []

  resources.forEach(resource => {
    resource.data.permissions.forEach(permission => {
      permissions.push(permission)
    })
  })

  const existingPermissions: any[] = (
    await em.find(permissionResource.data.pascalCaseName, {
      slug: {
        $in: permissions.map(permission => permission.slug)
      }
    })
  ).map(permission => permission.slug)

  const newPermissionsToCreate = permissions.filter(
    permission =>
      !existingPermissions.includes(
        typeof permission === 'string' ? permission : permission.slug
      )
  )

  const newSlugs = newPermissionsToCreate.map(permission => permission.slug)

  // Remove possible permission duplicates from the newPermissionsToCreate array.
  return Array.from(new Set(newSlugs)).map(
    slug => newPermissionsToCreate.find(permission => permission.slug === slug)!
  )
}
