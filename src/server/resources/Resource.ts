// import { Resource as ResourceInterface } from '../typings/interfaces'
import Pluralize from 'pluralize'
import Field from '../fields/Field'
import { paramCase, capitalCase } from 'change-case'

export class Resource {
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
}

export default Resource
