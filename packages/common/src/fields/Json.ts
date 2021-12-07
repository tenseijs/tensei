import Field from './Field'

export class Json extends Field {
  public databaseFieldType: string = 'json'

  constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.rules('json')
  }
}

export const json = (name: string, databaseField?: string) =>
  new Json(name, databaseField)

export default Json
