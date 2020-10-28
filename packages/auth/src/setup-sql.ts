import { ResourceContract, Permission, PluginSetupConfig } from '@tensei/common'
import { sentenceCase } from 'change-case'

import { AuthPluginConfig } from './config'

export const SetupMongodb = async (
    config: PluginSetupConfig,
    authConfig: AuthPluginConfig
) => {
    const { resources } = config
    const [, RoleResource, PermissionResource] = getAuthResources(
        resources,
        authConfig
    )

    // @ts-ignore
    const RoleModel = RoleResource.Model()
    // @ts-ignore
    const PermissionModel = PermissionResource.Model()

    const insertPermissions = await getPermissionsToInsert(
        resources,
        PermissionModel,
        'mongodb'
    )

    if (insertPermissions.length > 0) {
        await PermissionModel.insertMany(insertPermissions)
    }

    // Insert default roles
    // There will be two default roles: Authenticated & Public
    // Public will have no permissions attached by default
    let [authenticatedRole, publicRole] = await Promise.all([
        RoleModel.findOne({
            slug: 'authenticated'
        }),
        RoleModel.findOne({
            slug: 'public'
        })
    ])

    const rolesToCreate = []

    if (!authenticatedRole) {
        rolesToCreate.push(
            RoleModel.create({
                name: 'Authenticated',
                slug: 'authenticated'
            })
        )
    }

    if (!publicRole) {
        rolesToCreate.push(
            RoleModel.create({
                name: 'Public',
                slug: 'public'
            })
        )
    }

    await Promise.all(rolesToCreate)
}

const getAuthResources = (
    resources: ResourceContract[],
    authConfig: AuthPluginConfig
) => {
    const UserResource = resources.find(
        resource => resource.data.name === authConfig.nameResource
    )

    const RoleResource = resources.find(
        resource => resource.data.name === authConfig.roleResource
    )
    const PermissionResource = resources.find(
        resource => resource.data.name === authConfig.permissionResource
    )

    if (!UserResource || !RoleResource || !PermissionResource) {
        throw new Error(
            `Resources were not setup correctly. Something went wrong.`
        )
    }

    return [UserResource, RoleResource, PermissionResource]
}

const getPermissionsToInsert = async (
    resources: ResourceContract[],
    PermissionModel: any,
    database: 'sql' | 'mongodb'
) => {
    const permissions: Permission[] = []

    resources.forEach(resource => {
        ;['create', 'fetch', 'show', 'update', 'delete'].forEach(operation => {
            permissions.push(`${operation}:${resource.data.slug}`)
        })

        resource.data.actions.forEach(action => {
            permissions.push(`run:${resource.data.slug}:${action.data.slug}`)
        })

        resource.data.permissions.forEach(permission => {
            permissions.push(permission)
        })
    })

    // find all existing permissions
    const existingPermissions = (database === 'sql'
        ? await PermissionModel.query().whereIn('slug', permissions)
        : await PermissionModel.find({
              slug: {
                  $in: permissions
              }
          })
    ).map((permission: any) => permission.slug)

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

export const SetupSql = async (
    config: PluginSetupConfig,
    authConfig: AuthPluginConfig
) => {
    const { resources } = config
    const [, RoleResource, PermissionResource] = getAuthResources(
        resources,
        authConfig
    )

    // @ts-ignore
    const RoleModel = RoleResource.Model()
    // @ts-ignore
    const PermissionModel = PermissionResource.Model()

    const insertPermissions = await getPermissionsToInsert(
        resources,
        PermissionModel,
        'sql'
    )

    if (insertPermissions.length > 0) {
        await PermissionModel.query().insert(insertPermissions)
    }

    // Insert default roles
    // There will be two default roles: Authenticated & Public
    // Public will have no permissions attached by default
    let [authenticatedRole, publicRole] = await Promise.all([
        RoleModel.query().where({
            slug: 'authenticated'
        }),
        RoleModel.query().where({
            slug: 'public'
        })
    ])

    const rolesToCreate = []

    if (!authenticatedRole || !authenticatedRole[0]) {
        rolesToCreate.push(
            RoleModel.query().insert({
                name: 'Authenticated',
                slug: 'authenticated'
            })
        )
    }

    if (!publicRole || !publicRole[0]) {
        rolesToCreate.push(
            RoleModel.query().insert({
                name: 'Public',
                slug: 'public'
            })
        )
    }

    await Promise.all(rolesToCreate)
    // Authenticated will have all permissions by default
}
