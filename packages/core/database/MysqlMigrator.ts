import { MikroORM } from '@mikro-orm/core'

class MysqlMigrator {
  constructor(private orm: MikroORM, public entitiesMeta: any[]) {}
}

export default MysqlMigrator
