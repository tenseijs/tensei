import Field from './Field'

export class Text extends Field {
    protected sqlDatabaseFieldType: string = 'string'
}

export const text = (name: string, databaseField?: string) =>
    Text.make(name, databaseField)

export default Text
