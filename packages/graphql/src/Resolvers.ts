import { Utils } from '@tensei/common'
import { Configuration } from '@mikro-orm/core'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
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

    resources.forEach(resource => {
        !resource.isHiddenOnApi() &&
            !resource.data.hideOnFetchApi &&
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

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
                            resource,
                            getParsedInfo(info),
                            data
                        )

                        return data
                    })
            )

        !resource.isHiddenOnApi() &&
            !resource.data.hideOnFetchApi &&
            resolversList.push(
                graphQlQuery(`Fetch ${resource.data.snakeCaseNamePlural} count`)
                    .path(`${resource.data.snakeCaseNamePlural}__count`)
                    .query()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx) => {
                        const count = await ctx.manager.count(
                            resource.data.pascalCaseName,
                            parseWhereArgumentsToWhereQuery(args.where),
                            getFindOptionsFromArgs(args)
                        )

                        return count
                    })
            )

        !resource.isHiddenOnApi() &&
            !resource.data.hideOnFetchApi &&
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

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
                            resource,
                            getParsedInfo(info),
                            [data]
                        )

                        return data
                    })
            )

        !resource.isHiddenOnApi() &&
            !resource.data.hideOnInsertApi &&
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

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
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

                        ctx.emitter.emit(
                            `${resource.data.snakeCaseName}::inserted`,
                            data
                        )

                        return data
                    })
            )

        !resource.isHiddenOnApi() &&
            !resource.data.hideOnInsertApi &&
            resolversList.push(
                graphQlQuery(
                    `Insert multiple ${resource.data.snakeCaseNamePlural}`
                )
                    .path(`insert_${resource.data.snakeCaseNamePlural}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data: any[] = args.objects.map((object: any) =>
                            ctx.manager.create(
                                resource.data.pascalCaseName,
                                object
                            )
                        )

                        await ctx.manager.persistAndFlush(data)

                        await ctx.manager.persistAndFlush(data)

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
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

                        ctx.emitter.emit(
                            `${resource.data.snakeCaseNamePlural}::inserted`,
                            data
                        )

                        return data
                    })
            )

        !resource.data.hideOnUpdateApi &&
            !resource.isHiddenOnApi() &&
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
                        ).validate(args.object, false)

                        if (!passed) {
                            throw ctx.userInputError('Validation failed.', {
                                errors: payload
                            })
                        }

                        ctx.manager.assign(data, payload)

                        await ctx.manager.persistAndFlush(data)

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
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

                        ctx.emitter.emit(
                            `${resource.data.snakeCaseName}::updated`,
                            data
                        )

                        return data
                    })
            )

        !resource.data.hideOnUpdateApi &&
            !resource.isHiddenOnApi() &&
            resolversList.push(
                graphQlQuery(
                    `Update multiple ${resource.data.snakeCaseNamePlural}`
                )
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
                        ).validate(args.object, false)

                        if (!passed) {
                            throw ctx.userInputError('Validation failed.', {
                                errors: payload
                            })
                        }

                        data.forEach(d => ctx.manager.assign(d, args.object))

                        await ctx.manager.persistAndFlush(data)

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
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

                        ctx.emitter.emit(
                            `${resource.data.snakeCaseNamePlural}::updated`,
                            data
                        )

                        return data
                    })
            )

        !resource.data.hideOnDeleteApi &&
            !resource.isHiddenOnApi() &&
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

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
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

                        ctx.emitter.emit(
                            `${resource.data.snakeCaseName}::deleted`,
                            data
                        )

                        return data
                    })
            )

        !resource.data.hideOnDeleteApi &&
            !resource.isHiddenOnApi() &&
            resolversList.push(
                graphQlQuery(
                    `Delete multiple ${resource.data.snakeCaseNamePlural}`
                )
                    .path(`delete_${resource.data.snakeCaseNamePlural}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data = await ctx.manager.find(
                            resource.data.pascalCaseName,
                            parseWhereArgumentsToWhereQuery(args.where)
                        )

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            ctx.manager,
                            ctx.databaseConfig.type!,
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

                        ctx.emitter.emit(
                            `${resource.data.snakeCaseNamePlural}::deleted`,
                            data
                        )

                        return data
                    })
            )

        if (subscriptionsEnabled) {
            !resource.data.hideOnInsertSubscription &&
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

            !resource.data.hideOnUpdateSubscription &&
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

            !resource.data.hideOnDeleteSubscription &&
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

    if (args.order_by) {
        findOptions.orderBy = args.order_by
    }

    return JSON.parse(JSON.stringify(findOptions))
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
