import Field from './Field'
import format from 'date-fns/format'

export class DateField extends Field {
    /**
     *
     * Defines which day should be the first day of the week.
     *
     */
    private dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0

    /**
     *
     * The date format to be used
     * The date-fns library is used by
     * flamingo
     *
     * https://date-fns.org/v2.14.0/docs/format
     */
    private dateFormat: string = 'MM/dd/yyyy'

    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'DateField'

    /**
     *
     * Set which day should be the first day of the week.
     *
     * 0 => Sunday
     * 1 => Monday
     * 2 => Tuesday
     * 3 => Wednesday
     * 4 => Thursday
     * 5 => Friday
     * 6 => Saturday
     */
    public firstDayOfWeek(dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
        this.dayOfWeek = dayOfWeek

        return this
    }

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.default(format(new Date(), this.dateFormat))
    }

    /**
     *
     * Set the date format to be used
     * The date-fns library is used by
     * flamingo
     *
     * https://date-fns.org/v2.14.0/docs/format
     */
    public format(format: string) {
        this.dateFormat = format

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),

            firstDayOfWeek: this.dayOfWeek,

            format: this.dateFormat,
        }
    }
}

export default DateField
