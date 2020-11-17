import { tensei } from '@tensei/core'
import { graphql } from '@tensei/graphql'

import { resources } from '../../../helpers'

export const setup = () => tensei()
    .resources(resources)
    .plugins([
        graphql()
            .plugin()
    ])
    .databaseConfig({
        type: 'mysql',
        dbName: 'mikro_orm_graphql',
    })
    .register()
