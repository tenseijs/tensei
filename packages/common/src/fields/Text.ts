import Field from './Field'

export class Text extends Field {
    public component = {
        form: 'Text',
        index: 'Text',
        detail: 'Text'
    }

    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.columnTypes = ['varchar(255)']
    }
}

export const text = (name: string, databaseField?: string) =>
    new Text(name, databaseField)

export default Text
