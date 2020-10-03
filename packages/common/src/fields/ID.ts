import Field from './Field'
import { IDContract } from '@tensei/common'

interface Constructor<M> {
    new (...args: any[]): M
}

export class ID extends Field implements IDContract {
    /**
     *
     * If set to true, this field will
     * be cast to a string before
     * performing database
     * operations
     */
    public string: boolean = false

    /**
     *
     * With this set to true, this field will be
     * cast to a mongo object id before
     * performing database operations
     */
    public objectId: boolean = true

    public databaseFieldType: string = 'increments'

    /**
     * When a new ID field is created, by default,
     * we'll call the exceptOnForms() method.
     * That way, this field won't be
     * available on create
     * and update forms.
     */
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField || 'id')

        this.exceptOnForms()
    }

    /**
     *
     * Set Id type to be string
     */
    public asString() {
        this.string = true
        this.objectId = false

        return this
    }

    /**
     *
     * Set iD type to be object id
     */
    public asObjectId() {
        this.string = false
        this.objectId = true

        return this
    }

    /**
     * Create a new instance of the field
     * requires constructor parameters
     *
     */
    public static make<T extends Field>(
        this: Constructor<T>,
        name?: string,
        databaseField?: string
    ): T {
        return new this(name || 'ID', databaseField || 'id')
    }

    /**
     *
     * Add custom fields to the
     * serialize method
     */
    public serialize() {
        return {
            ...super.serialize(),
            asString: this.string,
            asObjectId: this.objectId
        }
    }
}

export const id = (name: string, databaseField?: string) =>
    ID.make(name, databaseField)

export default ID
