import Field from './Field'

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
}

export default HasMany
