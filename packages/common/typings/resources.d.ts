declare module '@tensei/common/resources' {
    import { Request } from 'express'
    import { SerializedField, FieldContract } from '@tensei/common/fields'
    import { SerializedAction, ActionContract } from '@tensei/common/actions'
    import {
        HookFunction,
        Permission,
        AuthorizeFunction,
        DatabaseRepositoryInterface,
        User,
    } from '@tensei/common/config'
    export interface ValidationMessages {
        [key: string]: string
    }
    export interface ResourceData {
        name: string
        table: string
        group: string
        slug: string
        label: string
        groupSlug: string
        valueField: string
        camelCaseName: string
        displayField: string
        noTimeStamps: boolean
        perPageOptions: number[]
        permissions: Permission[]
        displayInNavigation: boolean
        validationMessages: ValidationMessages
    }
    interface ResourceDataWithFields extends ResourceData {
        fields: FieldContract[]
        actions: ActionContract[]
    }
    export interface SerializedResource extends ResourceData {
        fields: SerializedField[]
        actions: SerializedAction[]
    }
    export abstract class ResourceContract<ResourceType = {}> {
        authorizeCallbacks: {
            authorizedToSee: AuthorizeFunction
            authorizedToCreate: AuthorizeFunction
            authorizedToUpdate: AuthorizeFunction
            authorizedToDelete: AuthorizeFunction
        }
        hooks: {
            beforeCreate: HookFunction
            beforeUpdate: HookFunction
            afterCreate: HookFunction
            afterUpdate: HookFunction
        }
        Model: () => any
        data: ResourceDataWithFields
        permissions(permissions: Permission[]): this
        canSee(authorizeFunction: AuthorizeFunction): this
        canCreate(authorizeFunction: AuthorizeFunction): this
        canUpdate(authorizeFunction: AuthorizeFunction): this
        canDelete(authorizeFunction: AuthorizeFunction): this
        displayField(displayField: string): this
        fields(fields: FieldContract[]): this
        actions(actions: ActionContract[]): this
        noTimeStamps(): this
        perPageOptions(perPageOptions: number[]): this
        displayInNavigation(): this
        hideFromNavigation(): this
        validationMessages(validationMessages: ValidationMessages): this
        group(groupName: string): this
        slug(slug: string): this
        label(label: string): this
        serialize(): SerializedResource
        beforeCreate(hook: HookFunction): this
        beforeUpdate(hook: HookFunction): this
        afterCreate(hook: HookFunction): this
        afterUpdate(hook: HookFunction): this
    }

    export declare class Resource extends ResourceContract {}

    export const resource: (
        name: string,
        tableName?: string | undefined
    ) => ResourceContract<{}>

    export abstract class ManagerContract {
        constructor(
            resources: ResourceContract[],
            db: DatabaseRepositoryInterface
        )
        findResource: (
            resourceSlug: string | ResourceContract
        ) => ResourceContract<{}>
        deleteById(
            request: Request,
            resourceSlugOrResource: string | ResourceContract,
            id: number | string
        ): Promise<void>
        createAdmin(
            request: Request,
            resourceSlugOrResource: string | ResourceContract,
            payload: DataPayload
        ): Promise<any>
        create(
            request: Request,
            resourceSlugOrResource: string | ResourceContract,
            payload: DataPayload
        ): Promise<any>
        update(
            request: Request,
            resourceSlugOrResource: string | ResourceContract,
            id: number | string,
            payload: DataPayload,
            patch?: boolean
        ): Promise<any>
        updateRelationshipFields(
            resource: ResourceContract,
            payload: DataPayload,
            modelId: string | number
        ): Promise<void>
        createRelationalFields(
            resource: ResourceContract,
            payload: DataPayload,
            model: any
        ): Promise<void>
        validateRequestQuery(
            {
                per_page: perPage,
                page,
                fields,
                search,
                filter,
                with: withRelationships,
                no_pagination: noPagination,
            }: Request['query'],
            resource: ResourceContract
        ): Promise<any>
        findAll(
            request: Request,
            resourceSlugOrResource: string | ResourceContract
        ): Promise<import('@tensei/common').FetchAllResults<{}>>
        findAllRelatedResource(
            request: Request,
            resourceId: string | number,
            resourceSlugOrResource: string | ResourceContract,
            relatedResourceSlugOrResource: string | ResourceContract
        ): Promise<{}>
        findOneById(
            request: Request,
            resourceSlugOrResource: string | ResourceContract,
            id: number | string,
            withRelated?: string[]
        ): Promise<any>
        getValidationRules: (
            resource: ResourceContract,
            creationRules?: boolean
        ) => {
            [key: string]: string
        }
        getResourceFieldsFromPayload: (
            payload: DataPayload,
            resource: ResourceContract
        ) => DataPayload
        breakFieldsIntoRelationshipsAndNonRelationships: (
            payload: DataPayload,
            resource: ResourceContract
        ) => {
            relationshipFieldsPayload: DataPayload
            nonRelationshipFieldsPayload: DataPayload
        }
        validate: (
            payload: DataPayload,
            resource: ResourceContract,
            creationRules?: boolean,
            modelId?: string | number | undefined
        ) => Promise<DataPayload>
        validateUniqueFields: (
            payload: DataPayload,
            resource: ResourceContract,
            creationRules?: boolean,
            modelId?: string | number | undefined
        ) => Promise<void>
        validateRelationshipFields: (
            payload: DataPayload,
            resource: ResourceContract
        ) => Promise<void>
        runAction: (
            request: Request,
            resourceSlug: string,
            actionSlug: string
        ) => Promise<ActionResponse>
        getAdministratorById: (
            id: number | string
        ) => Promise<import('@tensei/common').User | null>
        findUserByEmail: (email: string) => Promise<User | null>
        getAdministratorsCount: () => Promise<number>
    }

    export const Manager = ManagerContract
}
