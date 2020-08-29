import Field from './Field'

export class BooleanField extends Field {
    private true: string | undefined = undefined
    private false: string | undefined = undefined

    /**
     *
     * This would match the knex method name
     * on the create builder.
     */
    protected sqlDatabaseFieldType: string = 'boolean'

    public component: string = 'BooleanField'

    public trueValue(value: string) {
        this.true = value

        return this
    }

    public falseValue(value: string) {
        this.false = value

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),

            trueValue: this.true,
            falseValue: this.false,
        }
    }
}

export const boolean = (name: string, databaseField?: string) =>
    BooleanField.make(name, databaseField)

export default boolean
