import Integer from './Integer'
import { snakeCase } from 'change-case'
import Pluralize from 'pluralize'

export class HasMany extends Integer {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'HasManyField'

    protected sqlDatabaseFieldType: string = 'undefined'

    protected isRelationshipField: boolean = true

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string) {
        super(name, Pluralize(snakeCase(name)))

        this.rules('array')

        this.hideOnIndex()
    }
}

export const hasMany = (name: string) => new HasMany(name)

export default HasMany
