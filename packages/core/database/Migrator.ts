import { MikroORM } from '@mikro-orm/core'

class Migrator {
    constructor(private orm: MikroORM, public entitiesMeta: any[]) {}

    async init() {
        if (this.orm.config.get('type') === 'mongo') {
            return
        }

        const schemaGenerator = this.orm.getSchemaGenerator()

        await schemaGenerator.updateSchema(
            false,
            process.env.NODE_ENV !== 'production',
            false,
            false
        )
    }
}

export default Migrator
