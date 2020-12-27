import { ResourceContract, FilterOperators } from '@tensei/common'
import { EntityManager, ReferenceType, Configuration } from '@mikro-orm/core'

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

export const topLevelOperators: FilterOperators[] = ['_and', '_or', '_not']

export const allOperators = filterOperators.concat(topLevelOperators)

export const getFindOptionsFromArgs = (args: any) => {
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
}

export const getParsedInfo = (ql: any) => {
    const { parseResolveInfo } = require('graphql-parse-resolve-info')

    const parsedInfo = parseResolveInfo(ql, {
        keepRoot: false
    }) as any

    return parsedInfo.fieldsByTypeName[
        Object.keys(parsedInfo.fieldsByTypeName)[0]
    ]
}

export const parseWhereArgumentsToWhereQuery = (whereArgument: any) => {
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
}

export const populateFromResolvedNodes = async (
    resources: ResourceContract[],
    manager: EntityManager,
    database: keyof typeof Configuration.PLATFORMS,
    resource: ResourceContract,
    fieldNode: any,
    data: any[]
) => {
    if (!data.length) return

    const relationshipFields = resource?.data.fields.filter(
        f => f.relatedProperty.reference
    ) || []

    const relatedManyToOneFields = relationshipFields.filter(
        field => field.relatedProperty.reference === ReferenceType.MANY_TO_ONE
    )
    const relatedManyToManyFields = relationshipFields.filter(
        field => field.relatedProperty.reference === ReferenceType.MANY_TO_MANY
    )
    const relatedOneToManyFields = relationshipFields.filter(
        field => field.relatedProperty.reference === ReferenceType.ONE_TO_MANY
    )
    const relatedOneToOneFields = relationshipFields.filter(
        field => field.relatedProperty.reference === ReferenceType.ONE_TO_ONE
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
        const oneToOneSelections = Object.keys(
            fieldNode
        ).filter((selection: string) =>
            relatedOneToOneDatabaseFieldNames.includes(selection)
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
                            database === 'mongo' &&
                            field?.relatedProperty.owner
                        ) {
                            const relatedResource = resources.find(
                                r =>
                                    r.data.pascalCaseName ===
                                    field.relatedProperty.type
                            )
                            const relatedField = relatedResource?.data.fields.find(
                                f =>
                                    f.databaseField ===
                                    field.relatedProperty?.inversedBy
                            )
                        }

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
                                        [resource.data.snakeCaseNamePlural]: {
                                            id: {
                                                $in: [item.id]
                                            }
                                        },
                                        ...parseWhereArgumentsToWhereQuery(
                                            fieldNode[selection].args.where
                                        )
                                    },
                                    getFindOptionsFromArgs(
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
                                        [resource.data.snakeCaseName]: item.id,
                                        ...parseWhereArgumentsToWhereQuery(
                                            fieldNode[selection].args.where
                                        )
                                    },
                                    getFindOptionsFromArgs(
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
                oneToOneSelections.map((selection: string) =>
                    manager.populate(data, selection)
                )
            ),
            Promise.all(
                countSelectionNames.map(async selection => {
                    if (
                        relatedManyToManyDatabaseFieldNames.includes(selection)
                    ) {
                        const field = relatedManyToManyFields.find(
                            _ => _.databaseField === selection
                        )

                        if (
                            field?.relatedProperty.owner &&
                            database === 'mongo'
                        ) {
                            const relatedResource = resources.find(
                                r =>
                                    r.data.pascalCaseName ===
                                    field.relatedProperty.type
                            )
                            const relatedField = relatedResource?.data.fields.find(
                                f =>
                                    f.databaseField ===
                                    field.relatedProperty?.inversedBy
                            )
                            // we'll run a separate type of query for the owner.
                            // First we'll
                            // @ts-ignore
                            const counts = await manager.aggregate(
                                relatedField?.relatedProperty.type,
                                [
                                    {
                                        $match: {
                                            _id: {
                                                $in: data.map(d => d._id)
                                            },
                                            ...parseWhereArgumentsToWhereQuery(
                                                fieldNode[`${selection}__count`]
                                                    .args.where
                                            )
                                        }
                                    },
                                    {
                                        $project: {
                                            [`${relatedField?.relatedProperty.mappedBy}__count`]: {
                                                $size: `$${relatedField?.relatedProperty.mappedBy}`
                                            }
                                        }
                                    }
                                ]
                            )

                            data.map(item => {
                                item[
                                    `${relatedField?.relatedProperty.mappedBy}__count`
                                ] =
                                    (counts.find(
                                        (count: any) =>
                                            count._id.toString() ===
                                            item._id.toString()
                                    ) || {})[
                                        `${relatedField?.relatedProperty.mappedBy}__count`
                                    ] || null
                            })

                            return
                        }

                        await Promise.all(
                            data.map(async item => {
                                const count = await manager.count(
                                    field?.relatedProperty.type!,
                                    {
                                        [resource.data.snakeCaseNamePlural]:
                                            database === 'mongo'
                                                ? {
                                                      $in: [item.id.toString()]
                                                  }
                                                : {
                                                      id: {
                                                          $in: [
                                                              item.id.toString()
                                                          ]
                                                      }
                                                  },
                                        ...parseWhereArgumentsToWhereQuery(
                                            fieldNode[`${selection}__count`]
                                                .args.where
                                        )
                                    }
                                )

                                item[`${field?.databaseField}__count`] = count
                            })
                        )
                    }

                    if (
                        relatedOneToManyDatabaseFieldNames.includes(selection)
                    ) {
                        const field = relatedOneToManyFields.find(
                            _ => _.databaseField === selection
                        )

                        const uniqueKeys = Array.from(
                            new Set(data.map(_ => _.id))
                        )

                        const counts: any[] = await Promise.all(
                            uniqueKeys.map(async key =>
                                manager.count(field?.relatedProperty.type!, {
                                    [resource.data.snakeCaseName]: key,
                                    ...parseWhereArgumentsToWhereQuery(
                                        fieldNode[`${selection}__count`].args
                                            .where
                                    )
                                })
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
            const fieldTypes = fieldNode[manyToOneSelection].fieldsByTypeName

            if (Object.keys(fieldTypes).length > 0) {
                const field = relatedManyToOneFields.find(
                    f => f.databaseField === manyToOneSelection
                )!

                const relatedResource = resources.find(
                    r => r.data.name === field.relatedProperty.type
                )!

                await populateFromResolvedNodes(
                    resources,
                    manager,
                    database,
                    relatedResource,
                    fieldTypes[
                        Object.keys(
                            fieldNode[manyToOneSelection].fieldsByTypeName
                        )[0]
                    ],
                    data.map(d => d[field.databaseField])
                )
            }
        }

        for (const oneToOneSelection of oneToOneSelections) {
            const fieldTypes = fieldNode[oneToOneSelection].fieldsByTypeName

            if (Object.keys(fieldTypes).length > 0) {
                const field = relatedOneToOneFields.find(
                    f => f.databaseField === oneToOneSelection
                )!

                const relatedResource = resources.find(
                    r => r.data.name === field.relatedProperty.type
                )!

                await populateFromResolvedNodes(
                    resources,
                    manager,
                    database,
                    relatedResource,
                    fieldTypes[
                        Object.keys(
                            fieldNode[oneToOneSelection].fieldsByTypeName
                        )[0]
                    ],
                    data.map(d => d[field.databaseField])
                )
            }
        }

        for (const manyToManySelection of manyToManySelections) {
            const fieldTypes = fieldNode[manyToManySelection].fieldsByTypeName

            if (Object.keys(fieldTypes).length > 0) {
                const field = relatedManyToManyFields.find(
                    f => f.databaseField === manyToManySelection
                )!

                const relatedResource = resources.find(
                    r => r.data.name === field.relatedProperty.type
                )!

                await populateFromResolvedNodes(
                    resources,
                    manager,
                    database,
                    relatedResource,
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
            const fieldTypes = fieldNode[oneToManySelection].fieldsByTypeName

            if (Object.keys(fieldTypes).length > 0) {
                const field = relatedOneToManyFields.find(
                    f => f.databaseField === oneToManySelection
                )!

                const relatedResource = resources.find(
                    r => r.data.name === field.relatedProperty.type
                )!

                await populateFromResolvedNodes(
                    resources,
                    manager,
                    database,
                    relatedResource,
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
