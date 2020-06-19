// import { Resource as ResourceInterface } from '../typings/interfaces'
import Pluralize from 'pluralize'
import Field from '../fields/Field'
import { paramCase, capitalCase } from 'change-case'
import { DatabaseRepository } from 'server/typings/interfaces'
import Repository from 'server/database/Repository'

export class Resource {
    /**
     *
     * The private database instance. This will be
     * used to perform operations on the
     * resource.
     */
    private $db: Repository

    /**
     *
     * The model instance for this resource
     *
     */
    private $model: null | {} = null

    /**
     *
     * Instantiate resource with the model
     */
    public constructor($db: Repository) {
        this.$db = $db
    }

    /**
     * This would match a model, which is a
     * database row or collection
     * item
     */
    public model(model: {}) {
        this.$model = model

        return this
    }

    /**
     * This is the collection this resource will connect to
     * By default, it is the plural of the lower
     * case of the collection name.
     */
    public collection(): string {
        return Pluralize(paramCase(this.name()))
    }

    /**
     *
     * This is the primary key to be used to identify the resource
     * When resources are selected on the panel for example,
     * the primary key is used to identify them.
     */
    public primaryKey(): string {
        return '_id'
    }

    /**
     *
     * Use this to group resources on the left sidebar.
     * By default all resources are
     * in the `All` group
     */
    public group(): string {
        return 'All'
    }

    /**
     *
     * Define all the options for items to be fetched per page.
     * This would impact the number of items fetched on
     * page load.
     */
    public perPageOptions(): Array<number> {
        return [10, 25, 50, 100]
    }

    /**
     *
     * Determine if a resource should show up
     * on the left navigation.
     */
    public displayInNavigation(): boolean {
        return true
    }

    /**
     *
     * Get the name of the resource.
     */
    public name(): string {
        return this.constructor.name
    }

    /**
     *
     * This is the displayable label of the resource
     * It will appear on the left navigation
     * bar
     */
    public label(): string {
        return capitalCase(Pluralize(this.name()))
    }

    /**
     *
     * Define all the fields for this resource.
     * This array will be serialised and
     * sent to the frontend
     *
     */
    public fields(): Array<any> {
        return []
    }

    /**
     *
     * This will be used as the route param for
     * /resources/:param or /resuces/param
     */
    private param(): string {
        return Pluralize(paramCase(this.name()))
    }

    /**
     *
     * Set the custom validation messages for the
     * validation rules.
     */
    public messages(): {
        [key: string]: string
    } {
        return {}
    }

    /**
     * Serialize the resource to be sent to
     * the frontend
     *
     */
    public serialize(): {
        name: string
        label: string
        group: string
        param: string
        primaryKey: string
        collection: string
        fields: Array<any>
        displayInNavigation: boolean
        perPageOptions: Array<number>
        messages: { [key: string]: string }
    } {
        return {
            name: this.name(),
            label: this.label(),
            group: this.group(),
            param: this.param(),
            messages: this.messages(),
            primaryKey: this.primaryKey(),
            collection: this.collection(),
            perPageOptions: this.perPageOptions(),
            displayInNavigation: this.displayInNavigation(),
            fields: this.fields().map((field) => field.serialize()),
        }
    }

    public create = (data: any = this.$model) => {
        return this.$db.insertOne(this.collection(), data)
    }

    public findAll = () => {
        return this.$db.findAll(this.collection(), {})
    }

    public parseQueryParameters = (params: {} = {}) => {
        const query: any = {}

        const operators = [
            {
                key: '_in',
                value: '$in',
            },
            {
                key: '_lt',
                value: '$lt',
            },
            {
                key: '_nin',
                value: '$nin',
            },
            {
                key: '_ne',
                value: '$ne',
            },
            {
                key: '_gt',
                value: '$gt',
            },
            {
                key: '_lte',
                value: '$lte',
            },
            {
                key: '_gte',
                value: '$gte',
            },
        ]

        Object.keys(params).forEach((param) => {
            operators.forEach((operator) => {
                if (param.match(operator.key)) {
                    const field = param.split(operator.key)[0]

                    query[field] = {
                        ...(query[field] || {}),
                        [operator.value]: (params as any)[param],
                    }
                }
            })
        })

        return query
    }
}

export default Resource
