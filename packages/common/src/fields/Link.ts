import Text from './Text'

export class Link extends Text {
  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.rules('url')
  }
}

export const link = (name: string, databaseField?: string) =>
  new Link(name, databaseField)

export default Link
