import Field from './Field'
import { camelCase } from 'change-case'
import { FieldContract } from '@tensei/common'

export class BelongsTo extends Field {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'BelongsToField'

    protected isRelationshipField: boolean = false

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField || camelCase(name))

        this.hideOnIndex()
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

export const belongsToMongo = (name: string, databaseField?: string) =>
    new BelongsTo(name, databaseField)

export default belongsToMongo
