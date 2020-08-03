import Pluralize from 'pluralize'
import Field from '../fields/Field'
import { snakeCase } from 'change-case'

interface ResourceData {
    name: string
    table: string
    group: string
    fields: Field[]
    perPageOptions: number[]
    displayInNavigation: boolean
}

class Resource<ResourceType extends {}> {
    private $model: ResourceType | null = null

    private $models: ResourceType[] = []

    constructor(name: string, tableName?: string) {
        this.setValue('name', name)
        this.setValue('table', tableName || Pluralize(snakeCase(name)))
    }

    private data: ResourceData = {
        fields: [],
        table: '',
        perPageOptions: [],
        name: '',
        group: 'default',
        displayInNavigation: true,
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
        this.setValue('fields', fields)

        return this
    }

    private setValue(key: keyof ResourceData, value: any) {
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
}

export const resource = (name: string, tableName?: string) =>
    new Resource(name, tableName)

export default Resource
