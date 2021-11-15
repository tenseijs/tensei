import Text from './Text'
import { camelCase } from 'change-case'
import { SlugContract, SlugTypes } from '@tensei/common'

export class Slug extends Text implements SlugContract {
  private config = {
    from: '',
    inputName: '',
    type: 'default',
    editable: false
  }

  public component = {
    form: 'Slug',
    index: 'Text',
    detail: 'Text'
  }

  public from(field: string, inputName?: string) {
    this.config.from = field
    this.config.inputName = inputName || camelCase(field)

    return this
  }

  public type(type: SlugTypes) {
    this.config.type = type

    return this
  }

  public editable() {
    this.config.editable = true

    return this
  }

  public serialize() {
    return {
      ...super.serialize(),
      slugFrom: this.config.from,
      slugFromInputName: this.config.inputName,
      slugType: this.config.type,
      slugEditable: this.config.editable
    }
  }
}

export const slug = (name: string, databaseField?: string) =>
  new Slug(name, databaseField)

export default Slug
