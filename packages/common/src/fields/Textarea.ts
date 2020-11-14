import Text from './Text'

export class Textarea extends Text {
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.columnTypes = ['text']
    }
}

export const textarea = (name: string, databaseField?: string) =>
    new Textarea(name, databaseField)

export default Textarea
