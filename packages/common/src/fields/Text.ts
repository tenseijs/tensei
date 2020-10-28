import Field from './Field'

export class Text extends Field {
    public databaseFieldType: string = 'string'
}

export const text = (name: string, databaseField?: string) =>
    new Text(name, databaseField)

export default Text
