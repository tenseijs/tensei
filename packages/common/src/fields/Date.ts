import Field from './Field'
import format from 'date-fns/format'

export class DateField extends Field {
    /**
     *
     * Defines which day should be the first day of the week.
     *
     */
    protected dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0

    /**
     *
     * The date format to be used
     * The date-fns library is used by
     * tensei
     *
     * https://date-fns.org/v2.14.0/docs/format
     */
    protected dateFormat: string = 'MM/dd/yyyy'

    protected pickerFormat: string = 'MM/dd/yyyy'

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

    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'date'
        this.property.columnTypes = ['date']
    }

    /**
     *
     * Set the date format to be used
     * The luxon library is used by
     * tensei
     *
     * https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
     */
    public format(format: string) {
        this.dateFormat = format

        return this
    }

    public defaultToNow() {
        this.property.defaultRaw = 'now'

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),

            format: this.dateFormat,
            firstDayOfWeek: this.dayOfWeek,
            pickerFormat: this.pickerFormat || this.dateFormat
        }
    }
}

export const date = (name: string, databaseField?: string) =>
    new DateField(name, databaseField)

export default DateField
