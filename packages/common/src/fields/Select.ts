import Field from './Field'

export interface Option {
    label: string
    value: string
}

export class Select extends Field {
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.enum = true
        this.property.items = []
    }

    /**
     * Set the min value for this number field.
     * Will be the min on the number in
     * forms
     *
     */
    public options(options: Array<Option>) {
        this.property.items = options.map(option => option.value)

        return this
    }
}

export const select = (name: string, databaseField?: string) =>
    new Select(name, databaseField)

export default Select
