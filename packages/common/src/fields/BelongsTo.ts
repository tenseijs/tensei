import Integer from './Integer'
import { FieldContract } from '@tensei/common'
import { snakeCase, camelCase } from 'change-case'

export class BelongsTo extends Integer {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'BelongsToField'

    public databaseFieldType: string = 'integer'

    protected isRelationshipField: boolean = false

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField || snakeCase(`${name}_id`))

        this.foreign()

        this.unsigned()

        this.hideOnIndex()

        this.isSearchable = false
    }

    /**
     *
     * Make this field searchable. will also index
     * this field in the database.
     *
     */
    public searchable<T extends FieldContract>(this: T): T {
        this.isSearchable = false
        console.warn(`BelongsTo field cannot be made searchable.`)

        return this
    }

    public afterConfigSet() {
        if (this.tenseiConfig?.database === 'mongodb') {
            this.databaseField = camelCase(this.name)
        }
    }

    /**
     *
     * Make this field nullable
     *
     */
    public notNullable<T extends FieldContract>(this: T): T {
        console.warn(
            `BelongsTo relationships can not be set to notNullable(). We recommend adding a required validation rule instead.`
        )

        return this
    }
}

export const belongsTo = (name: string, databaseField?: string) =>
    new BelongsTo(name, databaseField)

export default BelongsTo
