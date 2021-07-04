import { pascalCase, camelCase } from 'change-case'
import { ReferenceType } from '@mikro-orm/core'
import RelationshipField from './RelationshipField'

// This would be hasMany in other relationship language.
export class OneToOne extends RelationshipField {
  public component = {
    form: 'OneToOne',
    index: 'OneToOne',
    detail: 'OneToOne'
  }

  public constructor(name: string, databaseField = camelCase(name)) {
    super(name, databaseField)

    this.relatedProperty.type = pascalCase(name)
    this.relatedProperty.reference = ReferenceType.ONE_TO_ONE

    this.rules(`unique:${databaseField}`)

    this.nullable()
    this.defaultFormValue(null)
  }
}

export const oneToOne = (name: string, databaseField?: string) =>
  new OneToOne(name, databaseField)

export const hasOne = oneToOne

export default oneToOne
