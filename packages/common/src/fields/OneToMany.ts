import Pluralize from 'pluralize'
import { ReferenceType } from '@mikro-orm/core'
import { pascalCase, snakeCase } from 'change-case'
import RelationshipField from './RelationshipField'

// This would be hasMany in other relationship language.
export class OneToMany extends RelationshipField {
  public component = {
    form: 'OneToMany',
    index: 'OneToMany',
    detail: 'OneToMany'
  }

  public constructor(name: string, databaseField = Pluralize(snakeCase(name))) {
    super(name, databaseField)

    this.defaultFormValue([])
    this.showOnPanel = true
    this.relatedProperty.type = pascalCase(name)
    this.relatedProperty.reference = ReferenceType.ONE_TO_MANY
  }
}

export const oneToMany = (name: string, databaseField?: string) =>
  new OneToMany(name, databaseField)

export const hasMany = oneToMany

export default oneToMany
