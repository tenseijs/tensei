import Field from './Field'
import { plural } from 'pluralize'
import { camelCase } from 'change-case'

interface Constructor<M> {
    new (...args: any[]): M
}

export class HasMany extends Field {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'HasManyField'

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.databaseField = databaseField || plural(camelCase(this.name))

        this.hideFromIndex()
    }

    /**
     *
     * @param this
     */
    public rules<T extends Field>(this: T, ...rules: Array<string>): T {
        this.validationRules = ['array', ...rules]

        return this
    }

    /**
     * Create a new instance of the field
     * requires constructor parameters
     *
     * @param name the name of the related resource.
     *
     * @param databaseField the database field for storing all relation references
     *
     */
    public static make<T extends Field>(
        this: Constructor<T>,
        name: string,
        databaseField?: string
    ): T {
        return new this(name, databaseField)
    }
}

export default HasMany
