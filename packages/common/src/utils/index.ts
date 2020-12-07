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

    parseWhereArgumentsToWhereQuery: (whereArgument: any) => {
        if (!whereArgument) {
            return {}
        }
        let whereArgumentString = JSON.stringify(whereArgument)

        allOperators.forEach(operator => {
            whereArgumentString = whereArgumentString.replace(
                `"${operator}"`,
                `"$${operator.split('_')[1]}"`
            )
        })

        return JSON.parse(whereArgumentString)
    },

    getFindOptionsFromArgs: (args: any) => {
        let findOptions: any = {}

        if (!args) {
            return {}
        }

        if (args.limit) {
            findOptions.limit = args.limit
        }

        if (args.offset) {
            findOptions.limit = args.offset
        }

        return findOptions
    },

    populateFromResolvedNodes: async (
        manager: EntityManager,
        resource: ResourceContract,
        resources: ResourceContract[],
        fieldNode: any,
        data: any[]
    ) => {
        if (!data.length) return

        const relationshipFields = resource.data.fields.filter(
            f => f.relatedProperty.reference
        )

        const relatedManyToOneFields = relationshipFields.filter(
            field =>
                field.relatedProperty.reference === ReferenceType.MANY_TO_ONE
        )
        const relatedManyToManyFields = relationshipFields.filter(
            field =>
                field.relatedProperty.reference === ReferenceType.MANY_TO_MANY
        )
        const relatedOneToManyFields = relationshipFields.filter(
            field =>
                field.relatedProperty.reference === ReferenceType.ONE_TO_MANY
        )
        const relatedOneToOneFields = relationshipFields.filter(
            field =>
                field.relatedProperty.reference === ReferenceType.ONE_TO_ONE
        )

        const relatedManyToOneDatabaseFieldNames = relatedManyToOneFields.map(
            field => field.databaseField
        )
        const relatedManyToManyDatabaseFieldNames = relatedManyToManyFields.map(
            field => field.databaseField
        )
        const relatedOneToManyDatabaseFieldNames = relatedOneToManyFields.map(
            field => field.databaseField
        )
        const relatedOneToOneDatabaseFieldNames = relatedOneToOneFields.map(
            field => field.databaseField
        )

        if (Object.keys(fieldNode).length > 0) {
            const countSelections = Object.keys(
                fieldNode
            ).filter((selection: string) => selection.match(/__count/))
            const countSelectionNames: string[] = countSelections.map(
                (selection: string) => selection.split('__')[0]
            )

            const manyToOneSelections = Object.keys(
                fieldNode
            ).filter((selection: string) =>
                relatedManyToOneDatabaseFieldNames.includes(selection)
            )
            const manyToManySelections = Object.keys(
                fieldNode
            ).filter((selection: string) =>
                relatedManyToManyDatabaseFieldNames.includes(selection)
            )
            const oneToManySelections = Object.keys(
                fieldNode
            ).filter((selection: string) =>
                relatedOneToManyDatabaseFieldNames.includes(selection)
            )

            await Promise.all([
                Promise.all(
                    manyToOneSelections.map((selection: string) =>
                        manager.populate(data, selection)
                    )
                ),
                Promise.all(
                    manyToManySelections.map((selection: string) =>
                        (async () => {
                            const field = relatedManyToManyFields.find(
                                _ => _.databaseField === selection
                            )

                            if (
                                !fieldNode[selection].args.where &&
                                !fieldNode[selection].args.limit &&
                                !fieldNode[selection].args.offset
                            ) {
                                await manager.populate(data, selection)

                                return
                            }

                            await Promise.all(
                                data.map(async item => {
                                    const relatedData: any = await manager.find(
                                        field?.relatedProperty.type!,
                                        {
                                            [resource.data
                                                .snakeCaseNamePlural]: {
                                                id: {
                                                    $in: [item.id]
                                                }
                                            },
                                            ...Utils.parseWhereArgumentsToWhereQuery(
                                                fieldNode[selection].args.where
                                            )
                                        },
                                        Utils.getFindOptionsFromArgs(
                                            fieldNode[selection].args
                                        )
                                    )

                                    item[field?.databaseField!] = relatedData
                                })
                            )
                        })()
                    )
                ),
                Promise.all(
                    oneToManySelections.map((selection: string) =>
                        (async () => {
                            if (
                                !fieldNode[selection].args.where &&
                                !fieldNode[selection].args.limit &&
                                !fieldNode[selection].args.offset
                            ) {
                                await manager.populate(data, selection)

                                return
                            }

                            const field = relatedOneToManyFields.find(
                                _ => _.databaseField === selection
                            )

                            await Promise.all(
                                data.map(async item => {
                                    const relatedData: any = await manager.find(
                                        field?.relatedProperty.type!,
                                        {
                                            [resource.data.snakeCaseName]:
                                                item.id,
                                            ...Utils.parseWhereArgumentsToWhereQuery(
                                                fieldNode[selection].args.where
                                            )
                                        },
                                        Utils.getFindOptionsFromArgs(
                                            fieldNode[selection].args
                                        )
                                    )

                                    item[field?.databaseField!] = relatedData
                                })
                            )
                        })()
                    )
                ),
                Promise.all(
                    countSelectionNames.map(async selection => {
                        if (
                            relatedManyToManyDatabaseFieldNames.includes(
                                selection
                            )
                        ) {
                            const field = relatedManyToManyFields.find(
                                _ => _.databaseField === selection
                            )

                            await Promise.all(
                                data.map(async item => {
                                    const count = await manager.count(
                                        field?.relatedProperty.type!,
                                        {
                                            [resource.data
                                                .snakeCaseNamePlural]: {
                                                id: {
                                                    $in: [item.id]
                                                }
                                            },
                                            ...Utils.parseWhereArgumentsToWhereQuery(
                                                fieldNode[`${selection}__count`]
                                                    .args.where
                                            )
                                        }
                                    )

                                    item[
                                        `${field?.databaseField}__count`
                                    ] = count
                                })
                            )
                        }

                        if (
                            relatedOneToManyDatabaseFieldNames.includes(
                                selection
                            )
                        ) {
                            const field = relatedOneToManyFields.find(
                                _ => _.databaseField === selection
                            )

                            const uniqueKeys = Array.from(
                                new Set(data.map(_ => _.id))
                            )

                            const counts: any[] = await Promise.all(
                                uniqueKeys.map(async key =>
                                    manager.count(
                                        field?.relatedProperty.type!,
                                        {
                                            [resource.data.snakeCaseName]: key,
                                            ...Utils.parseWhereArgumentsToWhereQuery(
                                                fieldNode[`${selection}__count`]
                                                    .args.where
                                            )
                                        }
                                    )
                                )
                            )

                            data.forEach(item => {
                                const index = uniqueKeys.indexOf(item.id)

                                item[`${field?.databaseField}__count`] =
                                    counts[index]
                            })
                        }
                    })
                )
            ])

            for (const manyToOneSelection of manyToOneSelections) {
                const fieldTypes =
                    fieldNode[manyToOneSelection].fieldsByTypeName

                if (Object.keys(fieldTypes).length > 0) {
                    const field = relatedManyToOneFields.find(
                        f => f.databaseField === manyToOneSelection
                    )!

                    const relatedResource = resources.find(
                        r => r.data.name === field.relatedProperty.type
                    )!

                    await Utils.populateFromResolvedNodes(
                        manager,
                        relatedResource,
                        resources,
                        fieldTypes[
                        Object.keys(
                            fieldNode[manyToOneSelection].fieldsByTypeName
                        )[0]
                        ],
                        data.map(d => d[field.databaseField])
                    )
                }
            }

            for (const manyToManySelection of manyToManySelections) {
                const fieldTypes =
                    fieldNode[manyToManySelection].fieldsByTypeName

                if (Object.keys(fieldTypes).length > 0) {
                    const field = relatedManyToManyFields.find(
                        f => f.databaseField === manyToManySelection
                    )!

                    const relatedResource = resources.find(
                        r => r.data.name === field.relatedProperty.type
                    )!

                    await Utils.populateFromResolvedNodes(
                        manager,
                        relatedResource,
                        resources,
                        fieldTypes[
                        Object.keys(
                            fieldNode[manyToManySelection].fieldsByTypeName
                        )[0]
                        ],
                        data
                            .map(d => d[field.databaseField])
                            .reduce((acc, d) => [...acc, ...d], [])
                    )
                }
            }

            for (const oneToManySelection of oneToManySelections) {
                const fieldTypes =
                    fieldNode[oneToManySelection].fieldsByTypeName

                if (Object.keys(fieldTypes).length > 0) {
                    const field = relatedOneToManyFields.find(
                        f => f.databaseField === oneToManySelection
                    )!

                    const relatedResource = resources.find(
                        r => r.data.name === field.relatedProperty.type
                    )!

                    await Utils.populateFromResolvedNodes(
                        manager,
                        relatedResource,
                        resources,
                        fieldTypes[
                        Object.keys(
                            fieldNode[oneToManySelection].fieldsByTypeName
                        )[0]
                        ],
                        data
                            .map(d => d[field.databaseField])
                            .reduce((acc, d) => [...acc, ...d], [])
                    )
                }
            }
        }

        return data
    }
}
