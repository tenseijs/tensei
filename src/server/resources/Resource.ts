// import { Resource as ResourceInterface } from '../typings/interfaces'
import Pluralize from 'pluralize'
import { paramCase, capitalCase } from 'change-case'

class Resource {
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
     * This will be used as the route param for
     * /resources/:param or /resuces/param
     */
    private param(): string {
        return Pluralize(paramCase(this.name()))
    }

    /**
     * Serialize the resource to be sent to
     * the frontend
     *
     */
    public serialize(): any {
        return {
            name: this.name(),
            label: this.label(),
            group: this.group(),
            param: this.param(),
            primaryKey: this.primaryKey(),
            collection: this.collection(),
            perPageOptions: this.perPageOptions(),
            displayInNavigation: this.displayInNavigation(),
        }
    }
}

export default Resource
