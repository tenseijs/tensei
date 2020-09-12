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
        ResourceHelpers,
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

    export interface ResourceContract<ResourceType = {}> {
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

    export class Resource implements ResourceContract {
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

    export const resource: (
        name: string,
        tableName?: string | undefined
    ) => ResourceContract<{}>

    export abstract class ManagerContract {
        repository: DatabaseRepositoryInterface
        constructor(
            request: Request,
            resources: ResourceContract[],
            database: DatabaseRepositoryInterface
        )
        deleteById(id: number | string): Promise<any>
        create(payload: DataPayload): Promise<any>
        database(resource?: ResourceContract): DatabaseRepositoryInterface
        updateOneByField(
            databaseField: string,
            value: any,
            payload: DataPayload
        ): Promise<any>
        update(
            id: number | string,
            payload: DataPayload,
            patch?: boolean
        ): Promise<any>
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
            resource?: ResourceContract<{}>
        ): Promise<any>
        findAll(
            query?: undefined
        ): Promise<import('@tensei/common').FetchAllResults<{}>>
        findAllRelatedResource(
            resourceId: string | number,
            relatedResourceSlugOrResource: string | ResourceContract
        ): Promise<{}>
        findOneById(id: number | string, withRelated?: string[]): Promise<any>
        getValidationRules: (
            creationRules?: boolean
        ) => {
            [key: string]: string
        }
        getResourceFieldsFromPayload: (payload: DataPayload) => DataPayload
        breakFieldsIntoRelationshipsAndNonRelationships: (
            payload: DataPayload
        ) => {
            relationshipFieldsPayload: DataPayload
            nonRelationshipFieldsPayload: DataPayload
        }
        validate: (
            payload: DataPayload,
            creationRules?: boolean,
            modelId?: string | number | undefined,
            resource?: ResourceContract<{}>
        ) => Promise<DataPayload>
        validateUniqueFields: (
            payload: DataPayload,
            creationRules?: boolean,
            modelId?: string | number | undefined,
            resource?: ResourceContract
        ) => Promise<void>
        validateRelationshipFields: (payload: DataPayload) => Promise<void>
        runAction: (
            actionSlug: string,
            payload?: DataPayload
        ) => Promise<ActionResponse>
        findAllCount: () => Promise<number>
        getFieldFromResource: (
            resource: ResourceContract,
            databaseField: string
        ) => import('@tensei/common').FieldContract | undefined
        setResource: (resourceOrSlug: ResourceContract | string) => this
        findResource: (
            resourceSlug: string | ResourceContract
        ) => ResourceContract<{}>
        findOneByField: (databaseField: string, value: any) => Promise<any>
    }

    export declare class Manager extends ManagerContract {}
}
