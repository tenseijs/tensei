import { id } from '../fields/ID'
import { Action } from '../actions/Action'
import {
    Permission,
    ResourceData,
    HookFunction,
    FieldContract,
    ResourceContract,
    AuthorizeFunction,
    ValidationMessages,
    SerializedResource,
} from '@tensei/common'

import Pluralize from 'pluralize'
import { snakeCase, paramCase, camelCase } from 'change-case'

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
    } = {
        authorizedToShow: [],
        authorizedToFetch: [],
        authorizedToCreate: [],
        authorizedToUpdate: [],
        authorizedToDelete: [],
    }

    public dashboardAuthorizeCallbacks: {
        authorizedToShow: AuthorizeFunction[]
        authorizedToFetch: AuthorizeFunction[]
        authorizedToCreate: AuthorizeFunction[]
        authorizedToUpdate: AuthorizeFunction[]
        authorizedToDelete: AuthorizeFunction[]
    } = {
        authorizedToShow: [],
        authorizedToFetch: [],
        authorizedToCreate: [],
        authorizedToUpdate: [],
        authorizedToDelete: [],
    }

    public hooks: {
        beforeCreate: HookFunction
        beforeUpdate: HookFunction
        afterCreate: HookFunction
        afterUpdate: HookFunction
    } = {
        beforeCreate: (payload, request) => {
            return payload
        },

        beforeUpdate: (payload, request) => {
            return payload
        },

        afterCreate: (payload, request) => {
            return payload
        },

        afterUpdate: (payload, request) => {
            return payload
        },
    }

    constructor(name: string, tableName?: string) {
        this.setValue('name', name)
        this.setValue('slug', Pluralize(paramCase(name)))
        this.setValue('label', Pluralize(name))
        this.setValue('camelCaseName', camelCase(name))
        this.setValue('camelCaseNamePlural', Pluralize(camelCase(name)))
        this.setValue('table', tableName || Pluralize(snakeCase(name)))
    }

    public Model = (): any => {
        return null
    }

    public data: ResourceDataWithFields = {
        fields: [],
        actions: [],
        table: '',
        name: '',
        slug: '',
        label: '',
        permissions: [],
        group: 'Resources',
        groupSlug: 'resources',
        displayField: 'id',
        valueField: 'id',
        noTimeStamps: false,
        camelCaseName: '',
        camelCaseNamePlural: '',
        validationMessages: {
            required: 'The {{ field }} is required.',
            email: 'The {{ field }} must be a valid email address.',
        },
        displayInNavigation: true,
        perPageOptions: [10, 25, 50],
    }

    public permissions(permissions: Permission[]) {
        this.setValue('permissions', permissions)

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

    public canShowOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToShow.push(authorizeFunction)

        return this
    }

    public canFetchOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToFetch.push(authorizeFunction)

        return this
    }

    public canCreateOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToCreate.push(authorizeFunction)

        return this
    }

    public canUpdateOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToUpdate.push(authorizeFunction)

        return this
    }

    public canDeleteOnDashboard(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks.authorizedToDelete.push(authorizeFunction)

        return this
    }

    public displayField(displayField: string) {
        this.setValue('displayField', displayField)

        return this
    }

    public fields(fields: FieldContract[]) {
        this.setValue('fields', [
            // We'll set the primary key here. We're not ready to allow custom primary keys yet.
            id('ID'),
            ...fields,
        ])

        return this
    }

    public actions(actions: Action[]) {
        this.setValue('actions', actions)

        return this
    }

    public noTimeStamps() {
        this.setValue('noTimeStamps', true)

        return this
    }

    private setValue(key: keyof ResourceDataWithFields, value: any) {
        this.data = {
            ...this.data,
            [key]: value,
        }
    }

    public perPageOptions(perPageOptions: number[]) {
        this.setValue('perPageOptions', perPageOptions)

        return this
    }

    public displayInNavigation() {
        this.setValue('displayInNavigation', true)

        return this
    }

    public hideFromNavigation() {
        this.setValue('displayInNavigation', false)

        return this
    }

    public validationMessages(validationMessages: ValidationMessages) {
        this.setValue('validationMessages', validationMessages)

        return this
    }

    public group(groupName: string) {
        this.setValue('group', groupName)
        this.setValue('groupSlug', paramCase(groupName))

        return this
    }

    public slug(slug: string) {
        this.setValue('slug', slug)

        return this
    }

    public label(label: string) {
        this.setValue('label', label)

        return this
    }

    public serialize(): SerializedResource {
        return {
            ...this.data,
            fields: this.data.fields.map((field) => field.serialize()),
            actions: this.data.actions.map((action) => action.serialize()),
        }
    }

    public beforeCreate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeCreate: hook,
        }

        return this
    }

    public beforeUpdate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeUpdate: hook,
        }

        return this
    }

    public afterCreate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            afterCreate: hook,
        }

        return this
    }

    public afterUpdate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            afterUpdate: hook,
        }

        return this
    }
}

export const resource = (name: string, tableName?: string) =>
    new Resource(name, tableName)

export default Resource
