import { id } from '../fields/ID'
import { Action } from '../actions/Action'
import {
    Permission,
    ResourceData,
    HookFunction,
    FieldContract,
    FilterContract,
    ResourceContract,
    AuthorizeFunction,
    ValidationMessages,
    SerializedResource,
    HookFunctionPromised,
    FlushHookFunction
} from '@tensei/common'

import Pluralize from 'pluralize'
// import { FilterContract } from '@tensei/filters'
import { snakeCase, paramCase, camelCase, pascalCase } from 'change-case'

interface ResourceDataWithFields extends ResourceData {
    fields: FieldContract[]
    actions: Action[]
}

export class Resource<ResourceType = {}> implements ResourceContract {
    public authorizeCallbacks: {
        authorizedToShow: AuthorizeFunction[]
        authorizedToFetch: AuthorizeFunction[]
        authorizedToCreate: AuthorizeFunction[]
        authorizedToUpdate: AuthorizeFunction[]
        authorizedToDelete: AuthorizeFunction[]
        authorizedToRunAction: AuthorizeFunction[]
    } = {
        authorizedToShow: [],
        authorizedToFetch: [],
        authorizedToCreate: [],
        authorizedToUpdate: [],
        authorizedToDelete: [],
        authorizedToRunAction: []
    }

    public dashboardAuthorizeCallbacks: {
        authorizedToShow: AuthorizeFunction[]
        authorizedToFetch: AuthorizeFunction[]
        authorizedToCreate: AuthorizeFunction[]
        authorizedToUpdate: AuthorizeFunction[]
        authorizedToDelete: AuthorizeFunction[]
        authorizedToRunAction: AuthorizeFunction[]
    } = {
        authorizedToShow: [],
        authorizedToFetch: [],
        authorizedToCreate: [],
        authorizedToUpdate: [],
        authorizedToDelete: [],
        authorizedToRunAction: []
    }

    public hooks: {
        onInit: HookFunction[]
        beforeCreate: HookFunctionPromised[]
        afterCreate: HookFunctionPromised[]
        beforeUpdate: HookFunctionPromised[]
        afterUpdate: HookFunctionPromised[]
        beforeDelete: HookFunctionPromised[]
        afterDelete: HookFunctionPromised[]
        beforeFlush: FlushHookFunction[]
        onFlush: FlushHookFunction[]
        afterFlush: FlushHookFunction[]
    } = {
        onInit: [],
        beforeCreate: [],
        afterCreate: [],
        beforeUpdate: [],
        afterUpdate: [],
        beforeDelete: [],
        afterDelete: [],
        beforeFlush: [],
        onFlush: [],
        afterFlush: []
    }

    constructor(name: string, tableName?: string) {
        this.data.name = name
        this.data.label = Pluralize(name)
        this.data.snakeCaseName = snakeCase(name)
        this.data.camelCaseName = camelCase(name)
        this.data.pascalCaseName = pascalCase(name)
        this.data.slug = Pluralize(paramCase(name))
        this.data.slugSingular = paramCase(name)
        this.data.slugPlural = Pluralize(paramCase(name))
        this.data.table = tableName || Pluralize(snakeCase(name))
        this.data.camelCaseNamePlural = Pluralize(camelCase(name))
        this.data.snakeCaseNamePlural = Pluralize(snakeCase(name))
    }

    public Model = (): any => {
        return null
    }

    public description(description: string) {
        this.data.description = description

        return this
    }

    public filters(filters: FilterContract[]) {
        this.data.filters = filters

        return this
    }

    public data: ResourceDataWithFields = {
        fields: [],
        actions: [],
        table: '',
        name: '',
        slug: '',
        label: '',
        filters: [],
        description: '',
        hideFromApi: false,
        permissions: [],
        group: 'Resources',
        groupSlug: 'resources',
        displayField: 'id',
        valueField: 'id',
        noTimeStamps: false,
        camelCaseName: '',
        snakeCaseName: '',
        snakeCaseNamePlural: '',
        camelCaseNamePlural: '',
        pascalCaseName: '',
        slugPlural: '',
        slugSingular: '',
        validationMessages: {
            required: 'The {{ field }} is required.',
            email: 'The {{ field }} must be a valid email address.'
        },
        displayInNavigation: true,
        perPageOptions: [10, 25, 50]
    }

    public permissions(permissions: Permission[]) {
        this.data.permissions = permissions

        return this
    }

    public hideFromApi() {
        this.data.hideFromApi = true

        return this
    }

    public canShow(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToShow.push(authorizeFunction)

        return this
    }

    public canFetch(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToFetch.push(authorizeFunction)

        return this
    }

    public canCreate(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToCreate.push(authorizeFunction)

        return this
    }

    public canUpdate(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToUpdate.push(authorizeFunction)

        return this
    }

    public canDelete(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToDelete.push(authorizeFunction)

        return this
    }

    public canRunAction(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToRunAction.push(authorizeFunction)

        return this
    }

    public canShowOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.dashboardAuthorizeCallbacks.authorizedToShow.push(
            authorizeFunction
        )

        return this
    }

    public canFetchOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.dashboardAuthorizeCallbacks.authorizedToFetch.push(
            authorizeFunction
        )

        return this
    }

    public canCreateOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.dashboardAuthorizeCallbacks.authorizedToCreate.push(
            authorizeFunction
        )

        return this
    }

    public canUpdateOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.dashboardAuthorizeCallbacks.authorizedToUpdate.push(
            authorizeFunction
        )

        return this
    }

    public canDeleteOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.dashboardAuthorizeCallbacks.authorizedToDelete.push(
            authorizeFunction
        )

        return this
    }

    public canRunActionOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.dashboardAuthorizeCallbacks.authorizedToRunAction.push(
            authorizeFunction
        )

        return this
    }

    public displayField(displayField: string) {
        this.data.displayField = displayField

        return this
    }

    public fields(fields: FieldContract[]) {
        if (this.data.fields.length) {
            this.data.fields = [...this.data.fields, ...fields]
        } else {
            this.data.fields = [id('ID'), ...fields]
        }

        return this
    }

    public actions(actions: Action[]) {
        this.data.actions = actions

        return this
    }

    public noTimeStamps() {
        this.data.noTimeStamps = true

        return this
    }

    public perPageOptions(perPageOptions: number[]) {
        this.data.perPageOptions = perPageOptions

        return this
    }

    public displayInNavigation() {
        this.data.displayInNavigation = true

        return this
    }

    public hideFromNavigation() {
        this.data.displayInNavigation = false

        return this
    }

    public validationMessages(validationMessages: ValidationMessages) {
        this.data.validationMessages = validationMessages

        return this
    }

    public group(groupName: string) {
        this.data.group = groupName
        this.data.groupSlug = paramCase(groupName)

        return this
    }

    public slug(slug: string) {
        this.data.slug = slug

        return this
    }

    public label(label: string) {
        this.data.label = label

        return this
    }

    public serialize(): SerializedResource {
        return {
            ...this.data,
            fields: this.data.fields.map(field => field.serialize()),
            actions: this.data.actions.map(action => action.serialize())
        }
    }

    public beforeCreate(hook: HookFunctionPromised) {
        this.hooks = {
            ...this.hooks,
            beforeCreate: [...this.hooks.beforeCreate, hook]
        }

        return this
    }

    public beforeUpdate(hook: HookFunctionPromised) {
        this.hooks = {
            ...this.hooks,
            beforeUpdate: [...this.hooks.beforeUpdate, hook]
        }

        return this
    }

    public afterUpdate(hook: HookFunctionPromised) {
        this.hooks = {
            ...this.hooks,
            afterUpdate: [...this.hooks.afterUpdate, hook]
        }

        return this
    }

    public beforeDelete(hook: HookFunctionPromised) {
        this.hooks = {
            ...this.hooks,
            beforeDelete: [...this.hooks.beforeDelete, hook]
        }

        return this
    }

    public afterDelete(hook: HookFunctionPromised) {
        this.hooks = {
            ...this.hooks,
            afterDelete: [...this.hooks.afterDelete, hook]
        }

        return this
    }

    public afterCreate(hook: HookFunctionPromised) {
        this.hooks = {
            ...this.hooks,
            afterCreate: [...this.hooks.afterCreate, hook]
        }

        return this
    }

    public onInit(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            onInit: [...this.hooks.onInit, hook]
        }

        return this
    }
}

export const resource = (name: string, tableName?: string) =>
    new Resource(name, tableName)

export default Resource
