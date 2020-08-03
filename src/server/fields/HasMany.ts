import Integer from './Integer'
import { snakeCase } from 'change-case'

export class HasMany extends Integer {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'HasManyField'

    protected sqlDatabaseFieldType: string = 'undefined'

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField || snakeCase(`${name}_id`))

        this.foreign()

        this.unsigned()

        this.hideFromIndex()
    }
}

export const hasMany = (name: string, databaseField?: string) =>
    HasMany.make(name, databaseField)

export default HasMany
