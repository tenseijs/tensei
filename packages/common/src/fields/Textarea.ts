import Text from './Text'

export class Textarea extends Text {
  public component = {
    form: 'Textarea',
    index: 'Textarea',
    detail: 'Textarea'
  }

  private toggleEnabled: boolean = true

  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.rules('string')
    this.property.columnTypes = ['text']
    this.hideOnIndex()
    this.notFilterable()
  }

  alwaysShow() {
    this.toggleEnabled = false

    return this
  }

  public serialize() {
    return {
      ...super.serialize(),
      toggleEnabled: this.toggleEnabled
    }
  }
}

export const textarea = (name: string, databaseField?: string) =>
  new Textarea(name, databaseField)

export default Textarea
