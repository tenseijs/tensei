import Field from './Field'

class ID extends Field {
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

    /**
     *
     * This overrides the default for the database field
     * Instead of camel case if ID, it will be _id
     *
     */
    public static make(name: string = 'ID', databaseField: string = '_id') {
        return new ID(name, databaseField)
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
     *
     * Add custom fields to the
     * serialize method
     */
    public serialize() {
        return {
            ...super.serialize(),
            asString: this.string,
            asObjectId: this.objectId,
        }
    }
}

export default ID
