import { Validator } from './Validator'
import { EntityManager } from '@mikro-orm/core'
import { ResourceContract } from '@tensei/core'

import * as Graphql from './graphql'

export const Utils = {
    validator: (
        resource: ResourceContract,
        manager: EntityManager,
        resourcesMap: {
            [key: string]: ResourceContract
        },
        modelId?: string | number
    ) => new Validator(resource, manager, resourcesMap, modelId),
    graphql: Graphql
}
