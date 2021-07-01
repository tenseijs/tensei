import Dayjs from 'dayjs'
import DateField from './Date'
import { ReferenceType, DateType } from '@mikro-orm/core'

export class Timestamp extends DateField {
    public component = {
        form: 'Timestamp',
        index: 'Timestamp',
        detail: 'Timestamp'
    }

    protected config = {
        ...super.config,
        pickerFormat: 'Y-m-d H:i',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        timePicker: true
    }

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'date'
        this.property.columnTypes = ['timestamp']
        this.property.reference = ReferenceType.SCALAR

        this.rules('date')

        this.defaultFormValue(Dayjs().format(this.config.dateFormat))
    }

    public defaultToNow() {
        this.property.defaultRaw = 'current_timestamp'

        return this
    }
}

export const timestamp = (name: string, databaseField?: string) =>
    new Timestamp(name, databaseField)

export default Timestamp
