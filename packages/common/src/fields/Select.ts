import Field from './Field'
import { camelCase } from 'change-case'

export interface Option {
  label: string
  value: string
}

export class Select extends Field {
  public component = {
    form: 'Select',
    index: 'Select',
    detail: 'Select'
  }

  private selectOptions: Option[] = []

  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.defaultFormValue('')
    this.property.enum = true
    this.property.items = []

    this.rules('string')
  }

  /**
   * Set the min value for this number field.
   * Will be the min on the number in
   * forms
   *
   */
  public options(options: Array<Option | string>) {
    this.selectOptions = options.map(option =>
      typeof option === 'string'
        ? {
            label: option,
            value: camelCase(option)
          }
        : option
    )

    this.property.items = this.selectOptions.map(option => option.value)

    this.rules(`in:${this.property.items.join(',')}`)

    return this
  }

  public serialize() {
    return {
      ...super.serialize(),
      selectOptions: this.selectOptions
    }
  }
}

class SelectOption {
  config: Option = {
    label: '',
    value: ''
  }

  label(label: string) {
    this.config.label = label

    return this
  }

  value(value: string) {
    this.config.value = value

    return this
  }
}

export const select = (name: string, databaseField?: string) =>
  new Select(name, databaseField)

select.option = () => new SelectOption()

export default Select
