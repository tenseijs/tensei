import Text from './Text'

export class Textarea extends Text {
    public databaseFieldType: string = 'text'
}

export const textarea = (name: string, databaseField?: string) =>
    new Textarea(name, databaseField)

export default Textarea
