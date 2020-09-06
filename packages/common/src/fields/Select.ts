import Field from './Field'

export interface Option {
    label: string
    value: string
}

export class Select extends Field {
    public selectOptions: Array<Option> = []

    protected sqlDatabaseFieldType: string = 'enu'

    /**
     * Set the min value for this number field.
     * Will be the min on the number in
     * forms
     *
     */
    public options(options: Array<Option>) {
        this.selectOptions = options

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
            selectOptions: this.selectOptions,
        }
    }
}

export const select = (name: string, databaseField?: string) =>
    new Select(name, databaseField)

export default Select
