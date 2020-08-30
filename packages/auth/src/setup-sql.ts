import { Resource, Permission } from '@tensei/common'
import { sentenceCase } from 'change-case'

import { AuthToolConfig } from './config'

export default async (resources: Resource[], config: AuthToolConfig) => {
    const UserResource = resources.find(
        (resource) => resource.data.name === config.nameResource
    )
    const RoleResource = resources.find(
        (resource) => resource.data.name === config.roleResource
    )
    const PermissionResource = resources.find(
        (resource) => resource.data.name === config.permissionResource
    )

    if (!UserResource || !RoleResource || !PermissionResource) {
        throw new Error(
            `Resources were not setup correctly. Something went wrong.`
        )
    }

    const UserModel = UserResource.Model()
    const RoleModel = RoleResource.Model()
    const PermissionModel = PermissionResource.Model()

    const permissions: Permission[] = []

    resources.forEach((resource) => {
        ;['create', 'read', 'update', 'delete'].forEach((operation) => {
            permissions.push(`${operation}:${resource.data.slug}`)

            resource.data.fields.forEach((field) => {
                permissions.push(
                    `${operation}:${resource.data.slug}:${field.databaseField}`
                )
            })
        })

        resource.data.actions.forEach((action) => {
            permissions.push(`run:${resource.data.slug}:${action.data.slug}`)
        })

        resource.data.permissions.forEach((permission) => {
            if (typeof permission === 'string') {
                permissions.push(permission)
            } else {
                permissions.push(permission)
            }
        })
    })

    // find all existing permissions
    const existingPermissions = (
        await PermissionModel.query().whereIn('slug', permissions)
    ).map((permission: any) => permission.slug)

    const newPermissionsToCreate = permissions.filter(
        (permission) =>
            !existingPermissions.includes(
                typeof permission === 'string' ? permission : permission.slug
            )
    )

    await PermissionModel.query().insert(
        newPermissionsToCreate.map((permission) => ({
            name:
                typeof permission === 'string'
                    ? sentenceCase(permission.split(':').join(' '))
                    : permission.name,
            slug: permission,
        }))
    )
}
