import dayjs from 'dayjs'
import Field from './Field'

export class DateField extends Field {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'DateField'

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.default(dayjs().subtract(7, 'year').format())
    }
}

export default DateField
