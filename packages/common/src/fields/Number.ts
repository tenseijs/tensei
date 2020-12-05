import Text from './Text'

export class NumberField extends Text {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component: string = `${this.constructor.name}`

    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'number'
        this.property.columnTypes = ['int']
    }

    /**
     * Set the min value for this number field.
     * Will be the min on the number in
     * forms
     *
     */
    public min(min: number) {
        this.attributes = {
            ...this.attributes,
            min
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
            max
        }

        return this
    }
}

export const number = (name: string, databaseField?: string) =>
    new NumberField(name, databaseField)

export default NumberField
