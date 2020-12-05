import DateField from './Date'

export class DateTime extends DateField {
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'date'
        this.property.columnTypes = ['datetime']
    }

    public afterConfigSet() {
        if (this.tenseiConfig?.databaseConfig.type === 'postgresql') {
            this.property.columnTypes = ['timestamp without time zone']
        }
    }

    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'DateTimeField'
}

export const dateTime = (name: string, databaseField?: string) =>
    new DateTime(name, databaseField)

export default DateTime
