import Dayjs from 'dayjs'
import Field from './Field'

export class DateField extends Field {
    public component = {
        form: 'Date',
        index: 'Date',
        detail: 'Date'
    }

    protected config = {
        dateFormat: 'YYYY-MM-DD',
        pickerFormat: 'Y-m-d H:i',
        timePicker: false,
        timePicker24Hr: false,
        options: {}
    }

    /**
     *
     * Defines which day should be the first day of the week.
     *
     */
    protected dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0

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
        this.defaultFormValue(Dayjs().format(this.config.dateFormat))
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
        this.config.dateFormat = format

        return this
    }

    public pickerOptions(options: any) {
        this.config.options = options

        return this
    }

    /**
     *
     * Set the format used in the date picker. This should be a format
     * supported by Flatpickr
     *
     * https://flatpickr.js.org/examples/
     */
    public pickerFormat(format: string) {
        this.config.dateFormat = format

        return this
    }

    public defaultToNow() {
        this.property.defaultRaw = 'now'
        this.defaultFormValue(new Date())

        return this
    }

    public timePicker24Hr() {
        this.config.timePicker24Hr = true

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),

            format: this.config.dateFormat,
            firstDayOfWeek: this.dayOfWeek,
            timePicker: this.config.timePicker,
            pickerOptions: this.config.options,
            pickerFormat: this.config.pickerFormat,
            timePicker24Hr: this.config.timePicker24Hr
        }
    }
}

export const date = (name: string, databaseField?: string) =>
    new DateField(name, databaseField)

export default DateField
