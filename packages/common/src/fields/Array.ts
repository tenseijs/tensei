import Field from './Field'

type ArrayTypes = 'string' | 'number' | 'decimal' | 'date' | 'objectId'

export class ArrayField extends Field {
    protected arrayOf: ArrayTypes = 'string'

    public databaseFieldType = 'array'

    public of(arrayOf: ArrayTypes) {
        this.arrayOf = arrayOf

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
