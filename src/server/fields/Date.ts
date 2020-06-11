import dayjs from 'dayjs'
import Field from './Field'

export class DateField extends Field {
    /**
     * 
     * Defines which day should be the first day of the week.
     * 
     */
    private dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0

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

        this.default(dayjs().subtract(7, 'year').format())
    }

    public serialize() {
        return {
            ...super.serialize(),

            firstDayOfWeek: this.dayOfWeek
        }
    }
}

export default DateField
