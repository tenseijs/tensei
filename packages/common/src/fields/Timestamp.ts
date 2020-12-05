import DateField from './Date'
import { ReferenceType } from '@mikro-orm/core'

export class Timestamp extends DateField {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'TimestampField'

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'date'
        this.property.columnTypes = ['timestamp']
        this.property.reference = ReferenceType.SCALAR
    }

    public defaultToNow() {
        this.property.defaultRaw = 'current_timestamp'

        return this
    }
}

export const timestamp = (name: string, databaseField?: string) =>
    new Timestamp(name, databaseField)

export default Timestamp
