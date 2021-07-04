import { pascalCase } from 'change-case'
import { ReferenceType } from '@mikro-orm/core'
import RelationshipField from './RelationshipField'

// This would be hasMany in other relationship language.
export class ManyToMany extends RelationshipField {
  public component = {
    form: 'ManyToMany',
    index: 'ManyToMany',
    detail: 'ManyToMany'
  }

  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.showOnPanel = true
    this.defaultFormValue([])
    this.relatedProperty.type = pascalCase(name)
    this.relatedProperty.reference = ReferenceType.MANY_TO_MANY
  }
}

export const manyToMany = (name: string, databaseField?: string) =>
  new ManyToMany(name, databaseField)
export const belongsToMany = manyToMany

export default manyToMany
