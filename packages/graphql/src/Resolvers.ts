import { Utils } from '@tensei/common'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { EntityManager, ReferenceType, Configuration } from '@mikro-orm/core'
import {
    GraphQlQueryContract,
    ResourceContract,
    FilterOperators,
    graphQlQuery,
    GraphQLPluginContext
} from '@tensei/common'

export const getResolvers = (
    resources: ResourceContract[],
    {
        subscriptionsEnabled,
        database
    }: {
        subscriptionsEnabled: boolean
        database: keyof typeof Configuration.PLATFORMS
    }
) => {
    const resolversList: GraphQlQueryContract[] = []

    const populateFromResolvedNodes = async (
        manager: EntityManager,
        resource: ResourceContract,
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
                                            [resource.data
                                                .snakeCaseNamePlural]: {
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
                                            [resource.data.snakeCaseName]:
                                                item.id,
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
                    countSelectionNames.map(async selection => {
                        if (
                            relatedManyToManyDatabaseFieldNames.includes(
                                selection
                            )
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
                                                    fieldNode[
                                                        `${selection}__count`
                                                    ].args.where
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
                                                          $in: [
                                                              item.id.toString()
                                                          ]
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
                                            ...parseWhereArgumentsToWhereQuery(
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

                    await populateFromResolvedNodes(
                        manager,
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

                    await populateFromResolvedNodes(
                        manager,
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
                const fieldTypes =
                    fieldNode[oneToManySelection].fieldsByTypeName

                if (Object.keys(fieldTypes).length > 0) {
                    const field = relatedOneToManyFields.find(
                        f => f.databaseField === oneToManySelection
                    )!

                    const relatedResource = resources.find(
                        r => r.data.name === field.relatedProperty.type
                    )!

                    await populateFromResolvedNodes(
                        manager,
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

    resources.forEach(resource => {
        resolversList.push(
            graphQlQuery(`Fetch ${resource.data.snakeCaseNamePlural}`)
                .path(resource.data.snakeCaseNamePlural)
                .query()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data: any[] = await ctx.manager.find(
                        resource.data.pascalCaseName,
                        parseWhereArgumentsToWhereQuery(args.where),
                        getFindOptionsFromArgs(args)
                    )

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        data
                    )

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Fetch single ${resource.data.snakeCaseName}`)
                .path(resource.data.snakeCaseName)
                .query()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data: any = await ctx.manager.findOneOrFail(
                        resource.data.pascalCaseName,
                        {
                            id: args.id
                        }
                    )

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        [data]
                    )

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Insert single ${resource.data.snakeCaseName}`)
                .path(`insert_${resource.data.snakeCaseName}`)
                .mutation()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const [passed, payload] = await Utils.validator(
                        resource,
                        ctx.manager,
                        ctx.resourcesMap
                    ).validate(args.object)

                    if (!passed) {
                        throw ctx.userInputError('Validation failed.', {
                            errors: payload
                        })
                    }

                    const data = ctx.manager.create(
                        resource.data.pascalCaseName,
                        payload
                    )

                    await ctx.manager.persistAndFlush(data)

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        [data]
                    )

                    subscriptionsEnabled &&
                        ctx.pubsub.publish(
                            `${resource.data.snakeCaseName}_inserted`,
                            {
                                [`${resource.data.snakeCaseName}_inserted`]: data
                            }
                        )

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Insert multiple ${resource.data.snakeCaseNamePlural}`)
                .path(`insert_${resource.data.snakeCaseNamePlural}`)
                .mutation()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data: any[] = args.objects.map((object: any) =>
                        ctx.manager.create(resource.data.pascalCaseName, object)
                    )

                    await ctx.manager.persistAndFlush(data)

                    await ctx.manager.persistAndFlush(data)

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        data
                    )

                    subscriptionsEnabled &&
                        data.forEach(d => {
                            ctx.pubsub.publish(
                                `${resource.data.snakeCaseName}_inserted`,
                                {
                                    [`${resource.data.snakeCaseName}_inserted`]: d
                                }
                            )
                        })

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Update single ${resource.data.snakeCaseName}`)
                .path(`update_${resource.data.snakeCaseName}`)
                .mutation()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data: any = await ctx.manager
                        .getRepository<any>(resource.data.pascalCaseName)
                        .findOneOrFail(args.id)

                    const [passed, payload] = await Utils.validator(
                        resource,
                        ctx.manager,
                        ctx.resourcesMap,
                        args.id
                    ).validate(args.object)

                    if (!passed) {
                        throw ctx.userInputError('Validation failed.', {
                            errors: payload
                        })
                    }

                    ctx.manager.assign(data, payload)

                    await ctx.manager.persistAndFlush(data)

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        [data]
                    )

                    subscriptionsEnabled &&
                        ctx.pubsub.publish(
                            `${resource.data.snakeCaseName}_updated`,
                            {
                                [`${resource.data.snakeCaseName}_updated`]: data
                            }
                        )

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Update multiple ${resource.data.snakeCaseNamePlural}`)
                .path(`update_${resource.data.snakeCaseNamePlural}`)
                .mutation()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data = await ctx.manager.find(
                        resource.data.pascalCaseName,
                        parseWhereArgumentsToWhereQuery(args.where)
                    )

                    const [passed, payload] = await Utils.validator(
                        resource,
                        ctx.manager,
                        ctx.resourcesMap
                    ).validate(args.object)

                    if (!passed) {
                        throw ctx.userInputError('Validation failed.', {
                            errors: payload
                        })
                    }

                    data.forEach(d => ctx.manager.assign(d, args.object))

                    await ctx.manager.persistAndFlush(data)

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        data
                    )

                    subscriptionsEnabled &&
                        data.forEach(d => {
                            ctx.pubsub.publish(
                                `${resource.data.snakeCaseName}_updated`,
                                {
                                    [`${resource.data.snakeCaseName}_updated`]: d
                                }
                            )
                        })

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Delete single ${resource.data.snakeCaseName}`)
                .path(`delete_${resource.data.snakeCaseName}`)
                .mutation()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data: any = await ctx.manager
                        .getRepository<any>(resource.data.pascalCaseName)
                        .findOneOrFail(args.id)

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        [data]
                    )

                    await ctx.manager.removeAndFlush(data)

                    subscriptionsEnabled &&
                        ctx.pubsub.publish(
                            `${resource.data.snakeCaseName}_deleted`,
                            {
                                [`${resource.data.snakeCaseName}_deleted`]: data
                            }
                        )

                    return data
                })
        )

        resolversList.push(
            graphQlQuery(`Delete multiple ${resource.data.snakeCaseNamePlural}`)
                .path(`delete_${resource.data.snakeCaseNamePlural}`)
                .mutation()
                .internal()
                .resource(resource)
                .handle(async (_, args, ctx, info) => {
                    const data = await ctx.manager.find(
                        resource.data.pascalCaseName,
                        parseWhereArgumentsToWhereQuery(args.where)
                    )

                    await populateFromResolvedNodes(
                        ctx.manager,
                        resource,
                        getParsedInfo(info),
                        data
                    )

                    await ctx.manager.removeAndFlush(data)

                    subscriptionsEnabled &&
                        data.forEach(d => {
                            ctx.pubsub.publish(
                                `${resource.data.snakeCaseName}_deleted`,
                                {
                                    [`${resource.data.snakeCaseName}_deleted`]: d
                                }
                            )
                        })

                    return data
                })
        )

        if (subscriptionsEnabled) {
            resolversList.push(
                graphQlQuery(
                    `${resource.data.snakeCaseName} inserted subscription`
                )
                    .subscription()
                    .path(`${resource.data.snakeCaseName}_inserted`)
                    .resource(resource)
                    .handle((_, args, ctx, info) =>
                        ctx.pubsub.asyncIterator([
                            `${resource.data.snakeCaseName}_inserted`
                        ])
                    )
            )

            resolversList.push(
                graphQlQuery(
                    `${resource.data.snakeCaseName} updated subscription`
                )
                    .subscription()
                    .path(`${resource.data.snakeCaseName}_updated`)
                    .resource(resource)
                    .handle((_, args, ctx, info) =>
                        ctx.pubsub.asyncIterator([
                            `${resource.data.snakeCaseName}_updated`
                        ])
                    )
            )

            resolversList.push(
                graphQlQuery(
                    `${resource.data.snakeCaseName} deleted subscription`
                )
                    .subscription()
                    .path(`${resource.data.snakeCaseName}_deleted`)
                    .resource(resource)
                    .handle((_, args, ctx, info) =>
                        ctx.pubsub.asyncIterator([
                            `${resource.data.snakeCaseName}_deleted`
                        ])
                    )
            )
        }
    })

    return resolversList
}

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

const getParsedInfo = (ql: any) => {
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

export const authorizeResolver = async (
    ctx: GraphQLPluginContext,
    query: GraphQlQueryContract
) => {
    const authorized = await Promise.all(
        query.config.authorize.map(fn => fn(ctx))
    )

    if (
        authorized.filter(result => result).length !==
        query.config.authorize.length
    ) {
        throw ctx.forbiddenError('Unauthorized.')
    }
}
