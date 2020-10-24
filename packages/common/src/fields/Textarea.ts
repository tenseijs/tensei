import Text from './Text'

export class Textarea extends Text {
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)
    }
}

export const textarea = (name: string, databaseField?: string) =>
    new Textarea(name, databaseField)

export default Textarea
