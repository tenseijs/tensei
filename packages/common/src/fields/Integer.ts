import Number from './Number'

export class Integer extends Number {
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

export const integer = (name: string, databaseField?: string) =>
    new Integer(name, databaseField)

export default Integer
