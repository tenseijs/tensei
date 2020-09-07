import Field from './Field'
import Integer from './Integer'
import { snakeCase } from 'change-case'
import Pluralize from 'pluralize'
import { FieldContract } from '@tensei/common'

export class BelongsToMany extends Integer {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'BelongsToManyField'

    protected isRelationshipField: boolean = true

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string) {
        super(name, Pluralize(snakeCase(name)))

        this.hideOnIndex()
    }

    /**
     *
     * Make this field nullable
     *
     */
    public notNullable<T extends FieldContract>(this: T): T {
        console.warn(
            `BelongsToMany relationships can not be set to notNullable() at the moment. We recommend adding a required validation rule instead.`
        )

        return this
    }
}

export const belongsToMany = (name: string) => new BelongsToMany(name)

export default BelongsToMany
