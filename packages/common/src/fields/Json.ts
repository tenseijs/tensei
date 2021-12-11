import Field from './Field'

export class Json extends Field {
  public databaseFieldType: string = 'json'

  public component = {
    form: 'Json',
    index: 'Json',
    detail: 'Json'
  }

  constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.rules('json')

    this.hideOnIndex()
  }
}

export const json = (name: string, databaseField?: string) =>
  new Json(name, databaseField)

export default Json
