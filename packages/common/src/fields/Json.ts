import Field from './Field'

export class Json extends Field {
    protected sqlDatabaseFieldType: string = 'json'
}

const stringifyValue = (value: string) =>
    typeof value === 'string' ? value : JSON.stringify(value)

export const json = (name: string, databaseField?: string) =>
    Json.make(name, databaseField)
        .beforeCreate((value) => stringifyValue(value))
        .beforeUpdate((value) => stringifyValue(value))

export default Json
