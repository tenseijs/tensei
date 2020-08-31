import Field from './Field'

export class BooleanField extends Field {
    protected sqlDatabaseFieldType: string = 'boolean'

    public component = 'BooleanField'

    private config = {
        trueLabel: 'Yes',
        falseLabel: 'No'
    }

        /**
     * Instantiate a new field. Requires the name,
     * and optionally the corresponding database
     * field. This field if not provided will
     * default to the camel case version of
     * the name.
     */
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.rules()
    }

    /**
     *
     * Set the default value of this
     * field
     *
     */
    public defaultValue: string|number|boolean = false

        /**
     *
     * @param this
     */
    public rules<T extends Field>(this: T, ...rules: Array<string>): T {
        this.validationRules = [
            'boolean',
            ...rules
        ]

        return this
    }

    public trueLabel(value: string) {
        this.config.trueLabel = value
    
        return this
    }

    public falseLabel(value: string) {
        this.config.falseLabel = value

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            trueLabel: this.config.trueLabel,
            falseLabel: this.config.falseLabel
        }
    }
}

export const boolean = (name: string, databaseField?: string) =>
    BooleanField.make(name, databaseField)

export default BooleanField
