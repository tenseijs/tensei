import { id } from '../fields/ID'
import { HookFunction } from '../config'
import Field, { SerializedField } from '../fields/Field'

import Pluralize from 'pluralize'
import { snakeCase, paramCase } from 'change-case'

interface ResourceData {
    name: string
    table: string
    group: string
    slug: string
    label: string
    noTimeStamps: boolean
    perPageOptions: number[]
    displayInNavigation: boolean
}

interface ResourceDataWithFields extends ResourceData {
    fields: Field[]
}

export interface SerializedResource extends ResourceData {
    fields: SerializedField[]
}

export class Resource<ResourceType = {}> {
    private $model: ResourceType | null = null

    private $models: ResourceType[] = []

    public hooks: {
        beforeCreate: HookFunction,
        beforeUpdate: HookFunction,
        afterCreate: HookFunction,
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
        this.setValue('table', tableName || Pluralize(snakeCase(name)))
    }

    public data: ResourceDataWithFields = {
        fields: [],
        table: '',
        name: '',
        slug: '',
        label: '',
        group: 'default',
        perPageOptions: [],
        displayInNavigation: true,
        noTimeStamps: false
    }

    public model($model: ResourceType) {
        this.$model = $model

        return this
    }

    public models($models: ResourceType[]) {
        this.$models = $models

        return this
    }

    public fields(fields: Field[]) {
        this.setValue('fields', [
            // We'll set the primary key here. We're not ready to allow custom primary keys yet.
            id('ID'),
            ...fields
        ])

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

    public group(groupName: string) {
        this.setValue('group', groupName)

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
            fields: this.data.fields.map(field => field.serialize())
        }
    }

    public beforeCreate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeCreate: hook
        }

        return this
    }

    public beforeUpdate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeUpdate: hook
        }

        return this
    }

    public afterCreate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            afterCreate: hook
        }

        return this
    }

    public afterUpdate(hook: HookFunction) {
        this.hooks = {
            ...this.hooks,
            afterUpdate: hook
        }

        return this
    }

}

export const resource = (name: string, tableName?: string) =>
    new Resource(name, tableName)

export default Resource
