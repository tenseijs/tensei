import Field from './Field'
import { singular } from 'pluralize'
import { FieldContract } from '@tensei/common'

export class HasManyEmbedded extends Field {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'HasManyEmbeddedField'

    /**
     *
     * This defines a list of all fields in this object.
     * It is also an array of fields.
     *
     */
    public objectFields: Array<Field> = []

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.hideFromIndex()
    }

    /**
     *
     * Define a list of all fields in this object.
     * It is also an array of fields.
     *
     */
    public fields(fields: Array<Field>) {
        this.objectFields = fields

        return this
    }

    /**
     *
     * @param this
     */
    public rules<T extends FieldContract>(this: T, ...rules: Array<string>): T {
        this.validationRules = ['array', ...rules]

        return this
    }

    /**
     *
     * Serialize the object field.
     */
    public serialize() {
        return {
            ...super.serialize(),
            singleName: singular(this.name),
            fields: this.objectFields.map((field) => field.serialize()),
        }
    }
}

export default HasManyEmbedded
