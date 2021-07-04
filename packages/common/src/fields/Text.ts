import Field from './Field'

export class Text extends Field {
  private substringCount: number = 32

  public component = {
    form: 'Text',
    index: 'Text',
    detail: 'Text'
  }

  truncate(sub: number) {
    this.substringCount = sub

    return this
  }

  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.defaultFormValue('')
    this.rules('string')
    this.property.columnTypes = ['varchar(255)']
  }

  public serialize() {
    return {
      ...super.serialize(),
      truncate: this.substringCount
    }
  }
}

export const text = (name: string, databaseField?: string) =>
  new Text(name, databaseField)

export default Text
