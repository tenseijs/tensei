import { Utils, DataPayload, GraphQlMiddleware } from '@tensei/common'
import { Configuration } from '@mikro-orm/core'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import {
  GraphQlQueryContract,
  ResourceContract,
  FilterOperators,
  graphQlQuery,
  AuthorizeFunction,
  GraphQLPluginContext
} from '@tensei/common'

export const getResolvers = (
  resources: ResourceContract<'graphql'>[],
  {
    subscriptionsEnabled,
    database
  }: {
    subscriptionsEnabled: boolean
    database: keyof typeof Configuration.PLATFORMS
  }
) => {
  const resolversList: GraphQlQueryContract[] = []

  const fetchSingleEntityMiddleware: (
    resource: ResourceContract<'graphql'>
  ) => GraphQlMiddleware = resource => async (
    resolve,
    parent,
    args,
    ctx,
    info
  ) => {
    const data: any = await ctx.manager.findOneOrFail(
      resource.data.pascalCaseName,
      {
        id: args.id
      }
    )

    ctx.entity = data

    return resolve(parent, args, ctx, info)
  }

  const authorizeResourceMiddleware: (
    authorizers: AuthorizeFunction[]
  ) => GraphQlMiddleware = authorizers => async (
    resolve,
    parent,
    args,
    ctx,
    info
  ) => {
    await authorizeResolver(ctx, authorizers)

    return resolve(parent, args, ctx, info)
  }

  resources.forEach(resource => {
    !resource.isHiddenOnApi() &&
      !resource.data.hideOnFetchApi &&
      resolversList.push(
        graphQlQuery(`Fetch ${resource.data.camelCaseNamePlural}`)
          .path(resource.data.camelCaseNamePlural)
          .query()
          .internal()
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToFetch
            )
          )
          .resource(resource)
          .handle(async (_, args, ctx, info) => {
            console.log(
              '@where',
              args.where,
              JSON.stringify(
                parseWhereArgumentsToWhereQuery(args.where),
                null,
                3
              )
            )
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
        graphQlQuery(`Fetch ${resource.data.camelCaseNamePlural} count`)
          .path(`${resource.data.camelCaseNamePlural}Count`)
          .query()
          .internal()
          .resource(resource)
          .middleware(...resource.data.fetchMiddleware)
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToFetch
            )
          )
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
        graphQlQuery(`Fetch single ${resource.data.camelCaseName}`)
          .path(resource.data.camelCaseName)
          .query()
          .internal()
          .middleware(...resource.data.fetchMiddleware)
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToShow
            ),
            fetchSingleEntityMiddleware(resource)
          )
          .resource(resource)
          .handle(async (_, args, ctx, info) => {
            const data = ctx.entity

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
      !resource.data.hideOnCreateApi &&
      resolversList.push(
        graphQlQuery(`Create single ${resource.data.camelCaseName}`)
          .path(`create${resource.data.pascalCaseName}`)
          .mutation()
          .internal()
          .resource(resource)
          .middleware(...resource.data.createMiddleware)
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToCreate
            )
          )
          .handle(async (_, args, ctx, info) => {
            const [passed, payload] = await Utils.validator(
              resource,
              ctx.manager,
              ctx.resourcesMap
            )
              .request(ctx.request)
              .validate(args.object)

            if (!passed) {
              throw ctx.userInputError('Validation failed.', {
                errors: payload
              })
            }

            const data: any = ctx.manager.create(
              resource.data.pascalCaseName,
              payload
            )

            await ctx.manager.persistAndFlush(data)

            subscriptionsEnabled &&
              ctx.pubsub.publish(`${resource.data.pascalCaseName}Created`, {
                [`${resource.data.pascalCaseName}Created`]: data
              })

            ctx.emitter.emit(`${resource.data.camelCaseName}::created`, data)

            return ctx.prepare(data)
          })
      )

    !resource.isHiddenOnApi() &&
      !resource.data.hideOnCreateApi &&
      resolversList.push(
        graphQlQuery(`Create multiple ${resource.data.camelCaseNamePlural}`)
          .path(`createMany${resource.data.pascalCaseNamePlural}`)
          .mutation()
          .internal()
          .middleware(...resource.data.createMiddleware)
          .resource(resource)
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToCreate
            )
          )
          .handle(async (_, args, ctx, info) => {
            const data: any[] = args.objects.map((object: any) =>
              ctx.manager.create(resource.data.pascalCaseName, object)
            )

            const validator = await Utils.validator(
              resource,
              ctx.manager,
              ctx.resourcesMap
            ).request(ctx.request)

            const results: [boolean, DataPayload][] = await Promise.all(
              args.objects.map((object: any) => validator.validate(object))
            )

            if (
              results.filter(([passed]) => passed).length !== results.length
            ) {
              throw ctx.userInputError('Validation failed.', {
                errors: results.map(([, payload]) => payload)
              })
            }

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
                ctx.pubsub.publish(`${resource.data.camelCaseName}Created`, {
                  [`${resource.data.camelCaseName}Created`]: d
                })
              })

            ctx.emitter.emit(`${resource.data.camelCaseName}::created`, data)

            return data
          })
      )

    !resource.data.hideOnUpdateApi &&
      !resource.isHiddenOnApi() &&
      resolversList.push(
        graphQlQuery(`Update single ${resource.data.pascalCaseName}`)
          .path(`update${resource.data.pascalCaseName}`)
          .mutation()
          .internal()
          .resource(resource)
          .middleware(...resource.data.updateMiddleware)
          .middleware(
            fetchSingleEntityMiddleware(resource),
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToUpdate
            )
          )
          .handle(async (_, args, ctx, info) => {
            const data: any = ctx.entity

            const [passed, payload] = await Utils.validator(
              resource,
              ctx.manager,
              ctx.resourcesMap,
              args.id
            )
              .request(ctx.request)
              .validate(args.object, false)

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
              ctx.pubsub.publish(`${resource.data.camelCaseName}Updated`, {
                [`${resource.data.camelCaseName}Updated`]: data
              })

            ctx.emitter.emit(`${resource.data.camelCaseName}::updated`, data)

            return data
          })
      )

    !resource.data.hideOnUpdateApi &&
      !resource.isHiddenOnApi() &&
      resolversList.push(
        graphQlQuery(`Update multiple ${resource.data.camelCaseNamePlural}`)
          .path(`updateMany${resource.data.pascalCaseNamePlural}`)
          .mutation()
          .internal()
          .resource(resource)
          .middleware(...resource.data.updateMiddleware)
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToUpdate
            )
          )
          .handle(async (_, args, ctx, info) => {
            const data = await ctx.manager.find(
              resource.data.pascalCaseName,
              parseWhereArgumentsToWhereQuery(args.where)
            )

            const [passed, payload] = await Utils.validator(
              resource,
              ctx.manager,
              ctx.resourcesMap
            )
              .request(ctx.request)
              .validate(args.object, false)

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
                ctx.pubsub.publish(`${resource.data.camelCaseName}Updated`, {
                  [`${resource.data.camelCaseName}Updated`]: d
                })
              })

            ctx.emitter.emit(
              `${resource.data.camelCaseNamePlural}::updated`,
              data
            )

            return data
          })
      )

    !resource.data.hideOnDeleteApi &&
      !resource.isHiddenOnApi() &&
      resolversList.push(
        graphQlQuery(`Delete single ${resource.data.pascalCaseName}`)
          .path(`delete${resource.data.pascalCaseName}`)
          .mutation()
          .internal()
          .resource(resource)
          .middleware(...resource.data.deleteMiddleware)
          .middleware(
            fetchSingleEntityMiddleware(resource),
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToDelete
            )
          )
          .handle(async (_, args, ctx, info) => {
            const data: any = ctx.entity

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
              ctx.pubsub.publish(`${resource.data.camelCaseName}Deleted`, {
                [`${resource.data.camelCaseName}Deleted`]: data
              })

            ctx.emitter.emit(`${resource.data.camelCaseName}::deleted`, data)

            return data
          })
      )

    !resource.data.hideOnDeleteApi &&
      !resource.isHiddenOnApi() &&
      resolversList.push(
        graphQlQuery(`Delete multiple ${resource.data.pascalCaseNamePlural}`)
          .path(`deleteMany${resource.data.pascalCaseNamePlural}`)
          .mutation()
          .internal()
          .middleware(...resource.data.deleteMiddleware)
          .resource(resource)
          .middleware(
            authorizeResourceMiddleware(
              resource.authorizeCallbacks.authorizedToDelete
            )
          )
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
                ctx.pubsub.publish(`${resource.data.camelCaseName}Deleted`, {
                  [`${resource.data.camelCaseName}Deleted`]: d
                })
              })

            ctx.emitter.emit(
              `${resource.data.camelCaseNamePlural}::deleted`,
              data
            )

            return data
          })
      )

    if (subscriptionsEnabled) {
      !resource.data.hideOnInsertSubscription &&
        resolversList.push(
          graphQlQuery(`${resource.data.camelCaseName} created subscription`)
            .subscription()
            .path(`${resource.data.camelCaseName}Created`)
            .resource(resource)
            .handle((_, args, ctx, info) =>
              ctx.pubsub.asyncIterator([
                `${resource.data.camelCaseName}Created`
              ])
            )
        )

      !resource.data.hideOnUpdateSubscription &&
        resolversList.push(
          graphQlQuery(`${resource.data.camelCaseName} updated subscription`)
            .subscription()
            .path(`${resource.data.camelCaseName}Updated`)
            .resource(resource)
            .handle((_, args, ctx, info) =>
              ctx.pubsub.asyncIterator([
                `${resource.data.camelCaseName}Updated`
              ])
            )
        )

      !resource.data.hideOnDeleteSubscription &&
        resolversList.push(
          graphQlQuery(`${resource.data.camelCaseName} deleted subscription`)
            .subscription()
            .path(`${resource.data.camelCaseName}Deleted`)
            .resource(resource)
            .handle((_, args, ctx, info) =>
              ctx.pubsub.asyncIterator([
                `${resource.data.camelCaseName}Deleted`
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
      new RegExp(`"${operator}"`, 'g'),
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
  authorizers: AuthorizeFunction[]
) => {
  const authorized = await Promise.all(
    authorizers.map(fn => fn(ctx as any, ctx.entity))
  )

  if (authorized.filter(result => result).length !== authorizers.length) {
    throw ctx.forbiddenError('Unauthorized.')
  }
}
