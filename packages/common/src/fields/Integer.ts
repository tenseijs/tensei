import Number from './Number'

export class Integer extends Number {
    protected isUnsigned: boolean = false

    /**
     *
     * This would match the knex method name
     * on the create builder.
     */
    protected sqlDatabaseFieldType: string = 'integer'

    public component: string = `${this.constructor.name}Field`

    public isForeign: boolean = false

    /**
     * Set the min value for this number field.
     * Will be the min on the number in
     * forms
     *
     */
    public min(min: number) {
        this.attributes = {
            ...this.attributes,
            min,
        }

        return this
    }

    /**
     * Set the max value for this number field.
     * Will be the max on the number in
     * forms
     *
     */
    public max(max: number) {
        this.attributes = {
            ...this.attributes,
            max,
        }

        return this
    }

    public foreign() {
        this.isForeign = true

        return this
    }

    /**
     *
     * Make this field sortable
     *
     */
    public unsigned() {
        this.isUnsigned = true

        return this
    }

    /**
     *
     * Add custom fields to the
     * serialize method
     */
    public serialize() {
        return {
            ...super.serialize(),

            isUnsigned: this.isUnsigned,
            isForeign: this.isForeign,
        }
    }
}

export const integer = (name: string, databaseField?: string) =>
    Integer.make(name, databaseField)

export default Integer
