import { Validator } from './Validator'
import { EntityManager, ReferenceType } from '@mikro-orm/core'
import { ResourceContract } from '@tensei/core'
import { FilterOperators } from '@tensei/common'

export const topLevelOperators: FilterOperators[] = ['_and', '_or', '_not']
export const filterOperators: FilterOperators[] = [
    '_eq',
    '_ne',
    '_in',
    '_nin',
    '_gt',
    '_gte',
    '_lt',
    '_lte',
    '_like',
    '_re',
    '_ilike',
    '_overlap',
    '_contains',
    '_contained'
]
export const allOperators = filterOperators.concat(topLevelOperators)

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
