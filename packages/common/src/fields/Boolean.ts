import Field from './Field'
import { BooleanFieldContract } from '@tensei/core'

export class BooleanField extends Field implements BooleanFieldContract {
  private booleanConfig = {
    trueLabel: 'Yes',
    falseLabel: 'No',
    positiveValues: ['true', true]
  }

  public component = {
    form: 'Boolean',
    index: 'Boolean',
    detail: 'Boolean'
  }

  /**
   * Instantiate a new field. Requires the name,
   * and optionally the corresponding database
   * field. This field if not provided will
   * default to the camel case version of
   * the name.
   */
  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.rules('boolean')

    this.defaultFormValue(false)

    this.property.type = 'boolean'
  }

  public trueLabel(value: string) {
    this.booleanConfig.trueLabel = value

    return this
  }

  public falseLabel(value: string) {
    this.booleanConfig.falseLabel = value

    return this
  }

  public positiveValues(values: any[]) {
    this.booleanConfig.positiveValues = values

    return this
  }

  public serialize() {
    return {
      ...super.serialize(),
      trueLabel: this.booleanConfig.trueLabel,
      falseLabel: this.booleanConfig.falseLabel,
      positiveValues: this.booleanConfig.positiveValues
    }
  }
}

export const boolean = (name: string, databaseField?: string) =>
  new BooleanField(name, databaseField)

export default BooleanField
