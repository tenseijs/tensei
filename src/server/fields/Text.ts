import Field from './Field'

export class Text extends Field {
    protected sqlDatabaseFieldType: string = 'string'
}

export default Text
