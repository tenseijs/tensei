import { ReferenceType } from '@mikro-orm/core'
import { pascalCase, snakeCase } from 'change-case'
import RelationshipField from './RelationshipField'

// This would be BelongsTo in other relationship language.
export class ManyToOne extends RelationshipField {
  public component = {
    form: 'ManyToOne',
    index: 'ManyToOne',
    detail: 'ManyToOne'
  }

  public constructor(name: string, databaseField = snakeCase(name)) {
    super(name, databaseField)

    this.defaultFormValue(null)
    this.relatedProperty.type = pascalCase(name)
    this.relatedProperty.reference = ReferenceType.MANY_TO_ONE
  }
}

export const manyToOne = (name: string, databaseField?: string) =>
  new ManyToOne(name, databaseField)
export const belongsTo = manyToOne

export default manyToOne
