import { applyMiddleware } from 'graphql-middleware'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'
import expressPlayground from 'graphql-playground-middleware-express'
import {
  gql,
  PubSub,
  withFilter,
  ApolloServer,
  ForbiddenError,
  UserInputError,
  ValidationError,
  AuthenticationError,
  makeExecutableSchema,
  GetMiddlewareOptions,
  Config as ApolloConfig,
  defaultPlaygroundOptions
} from 'apollo-server-express'
import {
  event,
  plugin,
  FieldContract,
  ResourceContract,
  PluginSetupConfig,
  GraphQlQueryContract
} from '@tensei/common'
import { ReferenceType } from '@mikro-orm/core'

import {
  getResolvers,
  filterOperators,
  topLevelOperators,
  authorizeResolver
} from './Resolvers'

import {
  defineCreateSubscriptionsForResource,
  defineDeleteSubscriptionsForResource,
  defineUpdateSubscriptionsForResource
} from './Subscriptions'

type OmittedApolloConfig = Omit<ApolloConfig, 'typeDefs' | 'resolvers'>

class Graphql {
  private appolloConfig: OmittedApolloConfig = {}

  private getMiddlewareOptions: GetMiddlewareOptions = {}

  private pubsub: PubSub | undefined

  schemaString: string = `
    scalar Date
    scalar JSON
    scalar JSONObject
    `

  private subscriptionsEnabled = false

  private getGraphqlFieldDefinitionForCreateInput = (
    field: FieldContract,
    resource: ResourceContract,
    resources: ResourceContract[],
    isUpdate?: boolean
  ) => {
    let FieldType = 'String'
    let FieldKey = field.databaseField

    if (field.property.enum) {
      FieldType = `${resource.data.pascalCaseName}${field.pascalCaseName}Enum`
    }

    if (
      ['integer', 'bigInteger', 'int', 'number', 'float', 'double'].includes(
        field.property.type!
      )
    ) {
      FieldType = 'Int'
    }

    if (field.property.type === 'boolean') {
      FieldType = 'Boolean'
    }

    if (field.property.type === 'boolean') {
      FieldType = 'Boolean'
    }

    if (!field.property.nullable && !isUpdate) {
      FieldType = `${FieldType}!`
    }

    if (
      field.relatedProperty.reference === ReferenceType.MANY_TO_ONE ||
      field.relatedProperty.reference === ReferenceType.ONE_TO_ONE
    ) {
      FieldType = `ID`
      FieldKey = field.databaseField
    }

    if (
      field.relatedProperty.reference === ReferenceType.ONE_TO_MANY ||
      field.relatedProperty.reference === ReferenceType.MANY_TO_MANY
    ) {
      FieldType = `[ID]`
      FieldKey = field.databaseField
    }

    if (field.property.type === 'Date') {
      FieldType = 'Date'
    }

    return `
  ${FieldKey}: ${FieldType}`
  }

  private getGraphqlFieldDefinition = (
    field: FieldContract,
    resource: ResourceContract,
    resources: ResourceContract[],
    config: PluginSetupConfig
  ) => {
    let FieldType = 'String'
    let FieldKey = field.databaseField

    if (field.property.enum) {
      FieldType = `${resource.data.pascalCaseName}${field.pascalCaseName}Enum`
    }

    if (field.property.type === 'boolean') {
      FieldType = 'Boolean'
    }

    if (['integer', 'bigInteger'].includes(field.property.type!)) {
      FieldType = 'Int'
    }

    if (field.property.primary) {
      FieldType = 'ID'
    }

    if (
      field.relatedProperty.reference === ReferenceType.ONE_TO_MANY ||
      field.relatedProperty.reference === ReferenceType.MANY_TO_MANY
    ) {
      const relatedResource = resources.find(
        resource => resource.data.name === field.name
      )

      if (relatedResource) {
        FieldType = `[${relatedResource.data.pascalCaseName}]`
        FieldKey = `${field.databaseField}(offset: Int, limit: Int, where: ${
          relatedResource.data.pascalCaseName
        }WhereQuery, orderBy: ${
          relatedResource.data.pascalCaseName
        }QueryOrder${this.getPossibleResourceFilters(relatedResource)})`
      }
    }

    if (field.property.type === 'Date') {
      FieldType = 'Date'
    }

    if (
      field.relatedProperty.reference === ReferenceType.MANY_TO_ONE ||
      field.relatedProperty.reference === ReferenceType.ONE_TO_ONE
    ) {
      const relatedResource = resources.find(
        resource => resource.data.name === field.name
      )

      if (relatedResource) {
        FieldType = `${relatedResource.data.pascalCaseName}`
        FieldKey = field.databaseField
      }
    }

    if (
      field.property.type === 'json' &&
      field.validationRules.includes('array')
    ) {
      FieldType = `[${FieldType}]`
    }

    if (!field.serialize().isNullable || field.property.primary) {
      FieldType = `${FieldType}!`
    }

    if (field.graphqlType) {
      FieldType = field.graphqlType
    }

    return `
  ${FieldKey}: ${FieldType}`
  }

  private defineFetchAllQueryForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `
  ${resource.data.camelCaseNamePlural}(offset: Int, limit: Int, where: ${
      resource.data.pascalCaseName
    }WhereQuery, orderBy: ${
      resource.data.pascalCaseName
    }QueryOrder${this.getPossibleResourceFilters(resource)}): [${
      resource.data.pascalCaseName
    }]`
  }

  private defineFetchAllCountQueryForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `
  ${resource.data.camelCaseNamePlural}Count(offset: Int, limit: Int, where: ${
      resource.data.pascalCaseName
    }WhereQuery${this.getPossibleResourceFilters(resource)}): Int!`
  }

  private defineFetchSingleQueryForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `
  ${resource.data.camelCaseName}(${this.getIdKey(config)}: ID!): ${
      resource.data.pascalCaseName
    }`
  }

  getWhereQueryFieldType(
    field: FieldContract,
    config: PluginSetupConfig,
    filter = false
  ) {
    if (field.property.type === 'boolean') {
      // return 'boolean_where_query'
    }

    if (
      [
        ReferenceType.MANY_TO_MANY,
        ReferenceType.ONE_TO_MANY,
        ReferenceType.MANY_TO_ONE,
        ReferenceType.ONE_TO_ONE
      ].includes(field.relatedProperty.reference!)
    ) {
      const relatedResource = config.resources.find(
        resource => resource.data.pascalCaseName === field.relatedProperty.type
      )

      return `${relatedResource?.data.pascalCaseName}${
        filter ? 'SubscriptionFilter' : 'WhereQuery'
      }`
    }

    if (field.property.primary) {
      return `IdWhereQuery`
    }

    if (field.property.type === 'integer') {
      return 'IntegerWhereQuery'
    }

    return 'StringWhereQuery'
  }

  getOrderByQueryForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `
input ${resource.data.pascalCaseName}QueryOrder {
    ${resource
      .getFetchApiExposedFields()
      .filter(f => !f.relatedProperty.reference && f.isSortable)
      .map(field => `${field.databaseField}: QueryOrder`)}
    
    ${resource
      .getFetchApiExposedFields()
      .filter(f => f.relatedProperty.reference && f.isSortable)
      .map(field => {
        const relatedResource = config.resourcesMap[field.relatedProperty.type!]

        return `${field.databaseField}: ${relatedResource.data.pascalCaseName}QueryOrder`
      })}
}        
`
  }

  getWhereQueryForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `
input ${resource.data.pascalCaseName}WhereQuery {
${topLevelOperators.map(
  operator =>
    `${operator}: ${
      operator === '_not'
        ? `${resource.data.pascalCaseName}WhereQuery`
        : `[${resource.data.pascalCaseName}WhereQuery]`
    }`
)}
${resource
  .getFetchApiExposedFields()
  .map(
    field =>
      `${field.databaseField}: ${this.getWhereQueryFieldType(field, config)}`
  )}
}
input ${resource.data.pascalCaseName}SubscriptionFilter {
    ${resource
      .getFetchApiExposedFields()
      .map(
        field =>
          `${field.databaseField}: ${this.getWhereQueryFieldType(
            field,
            config,
            true
          )}`
      )}
}
${
  resource.data.filters.length > 0
    ? `
enum ${resource.data.pascalCaseName}QueryFilterOptions {
    ${resource.data.filters.map(filter => `${filter.config.shortName}`)}
}
input ${resource.data.pascalCaseName}FilterQuery {
     name: ${resource.data.pascalCaseName}QueryFilterOptions
     args: JSONObject
}
`
    : ''
}
`
  }

  getFieldsTypeDefinition(resource: ResourceContract) {
    return resource.data.fields
      .filter(
        field =>
          !field.property.hidden && !field.serialize().isRelationshipField
      )
      .map(field => {
        return `
  ${field.databaseField}`
      })
  }

  private setupResourceGraphqlTypes(
    resources: ResourceContract[],
    config: PluginSetupConfig
  ) {
    resources.forEach(resource => {
      this.schemaString = `${this.schemaString}
${resource.data.fields
  .filter(field => field.property.enum && !field.property.hidden)
  .map(
    field => `
        enum ${resource.data.pascalCaseName}${
      field.pascalCaseName
    }Enum {${field.property.items?.map(
      option => `
            ${option}`
    )}
        }`
  )}
type ${resource.data.pascalCaseName} {${resource.data.fields
        .filter(
          field =>
            !field.property.hidden && !field.showHideFieldFromApi.hideOnFetchApi
        )
        .map(field =>
          this.getGraphqlFieldDefinition(field, resource, resources, config)
        )}
   ${resource.data.fields
     .filter(field =>
       [ReferenceType.MANY_TO_MANY, ReferenceType.ONE_TO_MANY].includes(
         field.relatedProperty.reference!
       )
     )
     .map(
       field =>
         `${field.databaseField}Count(where: ${
           field.pascalCaseName
         }WhereQuery${this.getPossibleResourceFilters(resource)}): Int`
     )}
}
${
  !resource.data.hideOnCreateApi
    ? `
input Create${resource.data.pascalCaseName}Input {${resource.data.fields
        .filter(
          field =>
            !field.property.primary &&
            !field.property.hidden &&
            !field.showHideFieldFromApi.hideOnCreateApi
        )
        .map(field =>
          this.getGraphqlFieldDefinitionForCreateInput(
            field,
            resource,
            resources
          )
        )}
}
`
    : ''
}

${
  !resource.data.hideOnUpdateApi
    ? `
input Update${resource.data.pascalCaseName}Input {${resource.data.fields
        .filter(
          field =>
            !field.property.primary &&
            !field.property.hidden &&
            !field.showHideFieldFromApi.hideOnUpdateApi
        )
        .map(field =>
          this.getGraphqlFieldDefinitionForCreateInput(
            field,
            resource,
            resources,
            true
          )
        )}
}
`
    : ''
}

${this.getWhereQueryForResource(resource, config)}
${this.getOrderByQueryForResource(resource, config)}
`
    })

    const resourcesWithQueryTypes = resources.filter(
      r => !r.isHiddenOnApi() && !r.data.hideOnFetchApi
    )

    if (resourcesWithQueryTypes.length > 0) {
      this.schemaString = `${
        this.schemaString
      }type Query {${resourcesWithQueryTypes.map(resource => {
        return `${this.defineFetchSingleQueryForResource(
          resource,
          config
        )}${this.defineFetchAllQueryForResource(
          resource,
          config
        )}${this.defineFetchAllCountQueryForResource(resource, config)}`
      })}
    }
    `
    } else {
      this.schemaString = `${this.schemaString}type Query {_: Boolean}`
    }

    this.schemaString = `${this.schemaString}

        enum QueryOrder {
            asc
            ascNullsLast
            ascNullsFirst
            desc
            descNullsLast
            descNullsFirst
        }                
`

    const createSubscriptions = resources.filter(
      r => !r.data.hideOnInsertSubscription
    )

    const updateSubscriptions = resources.filter(
      r => !r.data.hideOnUpdateSubscription
    )

    const deleteSubscriptions = resources.filter(
      r => !r.data.hideOnDeleteSubscription
    )

    if (
      createSubscriptions.length ||
      updateSubscriptions.length ||
      deleteSubscriptions.length
    ) {
      this.schemaString = `${
        this.schemaString
      }type Subscription {${createSubscriptions.map(
        resource => `${defineCreateSubscriptionsForResource(resource)}`
      )}
${updateSubscriptions.map(
  resource => `${defineUpdateSubscriptionsForResource(resource)}`
)}
${deleteSubscriptions.map(
  resource => `${defineDeleteSubscriptionsForResource(resource)}`
)}
}`
    }

    this.schemaString = `${this.schemaString}type Mutation {${resources
      .filter(r => !r.data.hideOnCreateApi)
      .map(resource => {
        return `${this.defineCreateMutationForResource(resource, config)}`
      })}
${resources
  .filter(r => !r.data.hideOnUpdateApi)
  .map(resource => {
    return `${this.defineUpdateMutationForResource(resource, config)}`
  })}
${resources
  .filter(r => !r.data.hideOnDeleteApi)
  .map(resource => {
    return `${this.defineDeleteMutationForResource(resource, config)}`
  })}
}
input StringWhereQuery {
    ${filterOperators.map(operator => {
      if (['_in', '_nin'].includes(operator)) {
        return `${operator}: [String!]`
      }

      return `${operator}: String`
    })}
}

input IntegerWhereQuery {
    ${filterOperators.map(operator => {
      if (['_in', '_nin'].includes(operator)) {
        return `${operator}: [Int!]`
      }

      return `${operator}: Int`
    })}
}

input IdWhereQuery {
    ${filterOperators.map(operator => {
      if (['_in', '_nin'].includes(operator)) {
        return `${operator}: [ID!]`
      }

      return `${operator}: ID`
    })}
}
`

    return this.schemaString
  }

  private defineCreateMutationForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `
        create${resource.data.pascalCaseName}(object: Create${resource.data.pascalCaseName}Input!): ${resource.data.pascalCaseName}!
        createMany${resource.data.pascalCaseNamePlural}(objects: [Create${resource.data.pascalCaseName}Input]!): [${resource.data.pascalCaseName}]!
    `
  }

  private defineUpdateMutationForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `update${resource.data.pascalCaseName}(${this.getIdKey(
      config
    )}: ID!, object: Update${resource.data.pascalCaseName}Input!): ${
      resource.data.pascalCaseName
    }!
        updateMany${resource.data.pascalCaseNamePlural}(where: ${
      resource.data.pascalCaseName
    }WhereQuery!, object: Update${
      resource.data.pascalCaseName
    }Input!${this.getPossibleResourceFilters(resource)}): [${
      resource.data.pascalCaseName
    }]!
        `
  }

  private defineDeleteMutationForResource(
    resource: ResourceContract,
    config: PluginSetupConfig
  ) {
    return `delete${resource.data.pascalCaseName}(${this.getIdKey(
      config
    )}: ID!): ${resource.data.pascalCaseName}
        deleteMany${resource.data.pascalCaseNamePlural}(where: ${
      resource.data.pascalCaseName
    }WhereQuery${this.getPossibleResourceFilters(resource)}): [${
      resource.data.pascalCaseName
    }]
        `
  }

  private getPossibleResourceFilters(resource: ResourceContract) {
    if (resource.data.filters.length === 0) {
      return ''
    }

    return `, filters: [${resource.data.pascalCaseName}FilterQuery]`
  }

  private getIdKey(config: PluginSetupConfig) {
    return 'id'
  }

  subscriptions(pubsub?: PubSub) {
    this.pubsub = pubsub || new PubSub()
    this.subscriptionsEnabled = true

    return this
  }

  configure(config: OmittedApolloConfig) {
    this.appolloConfig = config

    return this
  }

  middlewareOptions(config: GetMiddlewareOptions) {
    this.getMiddlewareOptions = config || {}

    return this
  }

  getResolversFromGraphqlQueries(queries: GraphQlQueryContract[]) {
    const resolvers: any = {
      Query: {},
      Mutation: {}
    }

    const subscriptions = queries.filter(q => q.config.type === 'SUBSCRIPTION')

    if (subscriptions.length !== 0) {
      resolvers.Subscription = {}
    }

    queries.forEach(query => {
      if (query.config.type === 'MUTATION') {
        resolvers.Mutation[query.config.path] = query.config.handler
      }

      if (query.config.type === 'QUERY') {
        resolvers.Query[query.config.path] = query.config.handler
      }

      if (query.config.type === 'SUBSCRIPTION') {
        resolvers.Subscription[query.config.path] = {
          subscribe: async (_: any, args: any, ctx: any, info: any) => {
            for (const middleware of query.config.middleware) {
              // await middleware(_, args, ctx, info)
            }

            await authorizeResolver(ctx, query.config.authorize)

            return withFilter(
              () => query.config.handler(_, args, ctx, info) as any,
              query.config.filter
            )(_, args, ctx, info)
          }
        }
      }
    })

    return resolvers
  }

  plugin() {
    return plugin('GraphQl')
      .extra({
        path: this.getMiddlewareOptions.path || 'graphql'
      })
      .register(async config => {
        const { extendGraphQlQueries, currentCtx, databaseConfig } = config

        this.setupResourceGraphqlTypes(currentCtx().resources, config)

        extendGraphQlQueries(
          getResolvers(
            currentCtx().resources.filter(
              resource => !resource.isHiddenOnApi()
            ),
            {
              subscriptionsEnabled: this.subscriptionsEnabled,
              database: databaseConfig.type!
            }
          )
        )
      })
      .boot(async config => {
        const {
          currentCtx,
          app,
          graphQlMiddleware,
          serverUrl,
          resources
        } = config

        const typeDefs = [
          gql(this.schemaString),
          ...currentCtx().graphQlTypeDefs
        ]

        graphQlMiddleware.unshift(
          async (resolve, parent, args, context, info) => {
            // set body to equal args
            context.body = args

            // register filters
            resources.forEach(resource => {
              resource.data.filters.forEach(filter => {
                context.manager.addFilter(
                  filter.config.shortName,
                  filter.config.cond,
                  resource.data.pascalCaseName,
                  filter.config.default
                )
              })
            })

            // set filter parameters
            resources.forEach(resource => {
              resource.data.filters.forEach(filter => {
                const filterFromBody = context.body?.filters?.find(
                  (bodyFitler: any) =>
                    bodyFitler.name === filter.config.shortName
                )

                context.manager.setFilterParams(
                  filter.config.shortName,
                  filterFromBody?.args || {}
                )
              })
            })

            // fork new manager instance for this request
            context.manager = context.manager.fork()

            context.authenticationError = (message?: string) =>
              new AuthenticationError(message || 'Unauthenticated.')

            context.forbiddenError = (message?: string) =>
              new ForbiddenError(message || 'Forbidden.')

            context.validationError = (message?: string) =>
              new ValidationError(message || 'Validation failed.')

            context.userInputError = (message?: string, properties?: any) =>
              new UserInputError(message || 'Invalid user input.', properties)

            const result = await resolve(parent, args, context, info)

            return result
          }
        )

        const resolvers = {
          ...this.getResolversFromGraphqlQueries(currentCtx().graphQlQueries),
          JSON: GraphQLJSON,
          JSONObject: GraphQLJSONObject
        }

        const schema = makeExecutableSchema({
          typeDefs,
          resolvers
        })

        // Add authorizer middleware to all graphql queries
        currentCtx().graphQlQueries.forEach(query => {
          query.middleware(async (resolve, parent, args, ctx, info) => {
            await authorizeResolver(ctx, query.config.authorize)

            return resolve(parent, args, ctx, info)
          })
        })

        const querySpecificMiddleware = currentCtx()
          .graphQlQueries.map(query => {
            if (query.config.middleware.length > 0) {
              return query.config.middleware
                .map(middleware => {
                  if (query.config.type === 'QUERY') {
                    return {
                      Query: {
                        [query.config.path]: middleware
                      }
                    }
                  }

                  if (query.config.type === 'MUTATION') {
                    return {
                      Mutation: {
                        [query.config.path]: middleware
                      }
                    }
                  }

                  return undefined as any
                })
                .filter(Boolean)
            }

            return []
          })
          .reduce((acc, middleware) => [...acc, ...middleware], [])

        const playgroundEndpoint = `${serverUrl}/${
          this.getMiddlewareOptions.path || 'graphql'
        }`

        const graphQlServer = new ApolloServer({
          schema: applyMiddleware(
            schema,
            // Register global middleware by spreading them to the applyMiddleware method.
            ...currentCtx().graphQlMiddleware,
            // Register query specific middleware by mapping through all registered queries, and generating the middleware for it.
            ...querySpecificMiddleware
          ),
          ...this.appolloConfig,
          context: ctx => ({
            ...ctx,
            ...config,
            pubsub: this.pubsub,
            db: currentCtx().db,
            repositories: currentCtx().db,
            manager: currentCtx().orm?.em?.fork()
          }),
          uploads: false,
          playground: false
        })

        app.get(
          `/${this.getMiddlewareOptions.path || 'graphql'}`,
          (request, response, next) =>
            expressPlayground({
              endpoint: `${playgroundEndpoint}?headers=${encodeURIComponent(
                JSON.stringify({
                  // @ts-ignore
                  'x-xsrf-token': request.csrfToken
                    ? // @ts-ignore
                      request.csrfToken()
                    : undefined
                })
              )}`,
              settings: {
                ...defaultPlaygroundOptions.settings,
                'request.credentials': 'same-origin',
                'editor.fontFamily':
                  "'Dank Mono', 'Operator Mono', 'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace"
              } as any
            })(request, response, next)
        )

        graphQlServer.applyMiddleware({
          app,
          ...this.getMiddlewareOptions
        })

        if (this.subscriptionsEnabled) {
          graphQlServer.installSubscriptionHandlers(config.server)
        }
      })
  }
}

export const graphql = () => new Graphql()
