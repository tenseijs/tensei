import Field from './Field'

type ArrayTypes = 'string' | 'number' | 'decimal' | 'date'

export class ArrayField extends Field {
    protected arrayOf: ArrayTypes = 'string'

    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'string[]'
    }

    public of(arrayOf: ArrayTypes) {
        this.arrayOf = arrayOf
        this.property.type = `${arrayOf}[]`

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            arrayOf: this.arrayOf
        }
    }
}

export const array = (name: string, databaseField?: string) =>
    new ArrayField(name, databaseField)
