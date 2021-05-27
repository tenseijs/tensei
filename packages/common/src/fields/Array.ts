import Field from './Field'

type ArrayTypes = 'string' | 'number' | 'decimal' | 'date'

export class ArrayField extends Field {
    protected arrayOf: ArrayTypes = 'string'

    public component = {
        form: 'Array',
        index: 'Array',
        detail: 'Array'
    }

    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'json'

        this.rules('array')
        this.arrayRules('string')
        this.notFilterable()

        this.hideOnIndex()
    }

    public of(arrayOf: ArrayTypes) {
        this.arrayOf = arrayOf
        this.arrayValidationRules = []
        this.arrayRules(
            {
                string: 'string',
                decimal: 'number',
                date: 'date',
                number: 'number'
            }[arrayOf]
        )

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
