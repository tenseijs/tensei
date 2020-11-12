import Field from './Field'

export class Text extends Field {}

export const text = (name: string, databaseField?: string) =>
    new Text(name, databaseField)

export default Text
