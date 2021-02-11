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
    let superAdminRole: any = await em.findOne(
        RoleResource.data.pascalCaseName,
        {
            slug: 'super-admin'
        }
    )

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
                description:
                    'Manage the access and level of responsibility of all users on this network.',
                admin_permissions: allPermissions
            })
    )
}

const getPermissionsToInsert = async (
    resources: ResourceContract[],
    em: EntityManager,
    permissionResource: ResourceContract
) => {
    const permissions: Permission[] = []

    resources.forEach(resource => {
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
