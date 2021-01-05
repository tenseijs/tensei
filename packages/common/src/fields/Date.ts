import Field from './Field'

export class DateField extends Field {
    public component = {
        form: 'Date',
        index: 'Date',
        detail: 'Date'
    }

    /**
     *
     * Defines which day should be the first day of the week.
     *
     */
    protected dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0

    /**
     *
     * The date format to be used
     * The luxon library is used by
     * tensei
     *
     * https://moment.github.io/luxon/docs/manual/parsing.html
     */
    protected dateFormat: string = 'yyyy-MM-dd hh:mm:ss'

    protected pickerFormat: string = 'yyyy-MM-dd'

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
