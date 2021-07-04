import { EntitySchema } from '@mikro-orm/core'

export class BaseEntity {
  constructor() {}
}

export default new EntitySchema({
  name: 'BaseEntity'
})
