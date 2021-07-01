import Dayjs from 'dayjs'
import DateField from './Date'
import { DateType } from '@mikro-orm/core'

export class DateTime extends DateField {
    protected config = {
        ...super.config,
        pickerFormat: 'Y-m-d H:i',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        timePicker: true
    }

    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = DateType
        this.property.columnTypes = ['datetime']
        this.defaultFormValue(Dayjs().format(this.config.dateFormat))
    }

    public afterConfigSet() {
        super.afterConfigSet()

        if (this.tenseiConfig?.databaseConfig.type === 'postgresql') {
            this.property.columnTypes = ['timestamp without time zone']
        }
    }
}

export const dateTime = (name: string, databaseField?: string) =>
    new DateTime(name, databaseField)

export default DateTime
