import { applyMiddleware } from 'graphql-middleware'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'
import {
    gql,
    ApolloServer,
    Config as ApolloConfig,
    makeExecutableSchema,
    AuthenticationError,
    ForbiddenError,
    ValidationError,
    UserInputError,
    GetMiddlewareOptions,
    PubSub,
    withFilter
} from 'apollo-server-express'
import {
    plugin,
    FieldContract,
    ResourceContract,
    PluginSetupConfig,
    GraphQLPluginExtension,
    GraphQlQueryContract
} from '@tensei/common'
import { ReferenceType } from '@mikro-orm/core'

import {
    topLevelOperators,
    filterOperators,
    getResolvers,
    authorizeResolver
} from './Resolvers'

import {
    defineCreateSubscriptionsForResource,
    defineDeleteSubscriptionsForResource,
    defineUpdateSubscriptionsForResource
} from './Subscriptions'

type OmittedApolloConfig = Omit<ApolloConfig, 'typeDefs' | 'resolvers'>

class Graphql {
    private pluginExtensions: GraphQLPluginExtension[] = []

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
            FieldType = `${resource.data.snakeCaseName}_${field.snakeCaseName}_enum`
        }

        if (
            [
                'integer',
                'bigInteger',
                'int',
                'number',
                'float',
                'double'
            ].includes(field.property.type!)
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

        if (field.relatedProperty.reference === ReferenceType.MANY_TO_ONE) {
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
            FieldType = `${resource.data.snakeCaseName}_${field.snakeCaseName}_enum`
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
                FieldType = `[${relatedResource.data.snakeCaseName}]`
                FieldKey = `${field.databaseField}(offset: Int, limit: Int, where: ${relatedResource.data.snakeCaseName}_where_query)`
            }
        }

        if (field.property.type === 'Date') {
            FieldType = 'Date'
        }

        if (field.relatedProperty.reference === ReferenceType.MANY_TO_ONE) {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            if (relatedResource) {
                FieldType = `${relatedResource.data.snakeCaseName}`
                FieldKey = field.databaseField
            }
        }

        if (!field.serialize().isNullable || field.property.primary) {
            FieldType = `${FieldType}!`
        }

        return `
  ${FieldKey}: ${FieldType}`
    }

    private defineFetchAllQueryForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `
  ${resource.data.snakeCaseNamePlural}(offset: Int, limit: Int, where: ${resource.data.snakeCaseName}_where_query): [${resource.data.snakeCaseName}]`
    }

    private defineFetchSingleQueryForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `
  ${resource.data.snakeCaseName}(${this.getIdKey(config)}: ID!): ${
            resource.data.snakeCaseName
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
                ReferenceType.MANY_TO_ONE
            ].includes(field.relatedProperty.reference!)
        ) {
            const relatedResource = config.resources.find(
                resource =>
                    resource.data.pascalCaseName === field.relatedProperty.type
            )

            return `${relatedResource?.data.snakeCaseName}_${
                filter ? 'subscription_filter' : 'where_query'
            }`
        }

        if (field.property.primary) {
            return `id_where_query`
        }

        if (field.property.type === 'integer') {
            return 'integer_where_query'
        }

        return 'string_where_query'
    }

    getWhereQueryForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `
input ${resource.data.snakeCaseName}_where_query {
${topLevelOperators.map(
    operator =>
        `${operator}: ${
            operator === '_not'
                ? `${resource.data.snakeCaseName}_where_query`
                : `[${resource.data.snakeCaseName}_where_query]`
        }`
)}
${resource
    .getFetchApiExposedFields()
    .map(
        field =>
            `${field.databaseField}: ${this.getWhereQueryFieldType(
                field,
                config
            )}`
    )}
}
input ${resource.data.snakeCaseName}_subscription_filter {
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
`
    }

    getFieldsTypeDefinition(resource: ResourceContract) {
        return resource.data.fields
            .filter(
                field =>
                    !field.property.hidden &&
                    !field.serialize().isRelationshipField
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
        enum ${resource.data.snakeCaseName}_${
            field.snakeCaseName
        }_enum {${field.property.items?.map(
            option => `
            ${option}`
        )}
        }`
    )}
type ${resource.data.snakeCaseName} {${resource.data.fields
                .filter(field => !field.property.hidden)
                .map(field =>
                    this.getGraphqlFieldDefinition(
                        field,
                        resource,
                        resources,
                        config
                    )
                )}
   ${resource.data.fields
       .filter(field =>
           [ReferenceType.MANY_TO_MANY, ReferenceType.ONE_TO_MANY].includes(
               field.relatedProperty.reference!
           )
       )
       .map(
           field =>
               `${field.databaseField}__count(where: ${field.snakeCaseName}_where_query): Int`
       )}
}
input create_${
                resource.data.snakeCaseName
            }_input {${resource.data.fields
                .filter(
                    field => !field.property.primary && !field.property.hidden
                )
                .map(field =>
                    this.getGraphqlFieldDefinitionForCreateInput(
                        field,
                        resource,
                        resources
                    )
                )}
}

input update_${
                resource.data.snakeCaseName
            }_input {${resource.data.fields
                .filter(
                    field => !field.property.primary && !field.property.hidden
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

enum ${resource.data.snakeCaseName}_fields_enum {${this.getFieldsTypeDefinition(
                resource
            )}
}

${this.getWhereQueryForResource(resource, config)}
`
        })

        this.schemaString = `${this.schemaString}type Query {${resources.map(
            resource => {
                return `${this.defineFetchSingleQueryForResource(
                    resource,
                    config
                )}${this.defineFetchAllQueryForResource(resource, config)}`
            }
        )}
}
`
        this.schemaString = `${
            this.schemaString
        }type Subscription {${resources.map(
            resource => `${defineCreateSubscriptionsForResource(resource)}`
        )}
${resources.map(
    resource => `${defineUpdateSubscriptionsForResource(resource)}`
)}
${resources.map(
    resource => `${defineDeleteSubscriptionsForResource(resource)}`
)}
}`

        this.schemaString = `${this.schemaString}type Mutation {${resources.map(
            resource => {
                return `${this.defineCreateMutationForResource(
                    resource,
                    config
                )}`
            }
        )}
${resources.map(resource => {
    return `${this.defineUpdateMutationForResource(resource, config)}`
})}
${resources.map(resource => {
    return `${this.defineDeleteMutationForResource(resource, config)}`
})}
}
input string_where_query {
    ${filterOperators.map(operator => {
        if (['_in', '_nin'].includes(operator)) {
            return `${operator}: [String!]`
        }

        return `${operator}: String`
    })}
}

input integer_where_query {
    ${filterOperators.map(operator => {
        if (['_in', '_nin'].includes(operator)) {
            return `${operator}: [Int!]`
        }

        return `${operator}: Int`
    })}
}

input id_where_query {
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
        insert_${resource.data.snakeCaseName}(object: create_${resource.data.snakeCaseName}_input!): ${resource.data.snakeCaseName}!
        insert_${resource.data.snakeCaseNamePlural}(objects: [create_${resource.data.snakeCaseName}_input]!): [${resource.data.snakeCaseName}]!
    `
    }

    private defineUpdateMutationForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `update_${resource.data.snakeCaseName}(${this.getIdKey(
            config
        )}: ID!, object: update_${resource.data.snakeCaseName}_input!): ${
            resource.data.snakeCaseName
        }!
        update_${resource.data.snakeCaseNamePlural}(where: ${
            resource.data.snakeCaseName
        }_where_query!, object: update_${
            resource.data.snakeCaseName
        }_input!): [${resource.data.snakeCaseName}]!
        `
    }

    private defineDeleteMutationForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `delete_${resource.data.snakeCaseName}(${this.getIdKey(
            config
        )}: ID!): ${resource.data.snakeCaseName}
        delete_${resource.data.snakeCaseNamePlural}(where: ${
            resource.data.snakeCaseName
        }_where_query): [${resource.data.snakeCaseName}]
        `
    }

    private getIdKey(config: PluginSetupConfig) {
        return 'id'
    }

    extensions(extensions: GraphQLPluginExtension[]) {
        this.pluginExtensions = extensions

        return this
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
            Mutation: {},
            Subscription: {}
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
                    subscribe: async (
                        _: any,
                        args: any,
                        ctx: any,
                        info: any
                    ) => {
                        for (const middleware of query.config.middleware) {
                            await middleware(_, args, ctx, info)
                        }

                        await authorizeResolver(ctx, query)

                        return withFilter(
                            () =>
                                query.config.handler(_, args, ctx, info) as any,
                            query.config.filter
                        )(_, args, ctx, info)
                    }
                }
            }
        })

        return resolvers
    }

    plugin() {
        return plugin('GraphQl').boot(async config => {
            const { extendGraphQlQueries, currentCtx, app } = config

            const exposedResources = currentCtx().resources.filter(
                resource => !resource.hiddenFromApi()
            )

            this.setupResourceGraphqlTypes(exposedResources, config)

            extendGraphQlQueries(
                getResolvers(exposedResources, {
                    subscriptionsEnabled: this.subscriptionsEnabled
                })
            )

            const typeDefs = [
                gql(this.schemaString),
                ...currentCtx().graphQlTypeDefs
            ]

            currentCtx().graphQlMiddleware.unshift(
                () => {
                    return async (resolve, parent, args, context, info) => {
                        context.body = args

                        const result = await resolve(
                            parent,
                            args,
                            context,
                            info
                        )

                        return result
                    }
                },
                () => {
                    return async (resolve, parent, args, context, info) => {
                        context.manager = context.manager.fork()

                        const result = await resolve(
                            parent,
                            args,
                            context,
                            info
                        )

                        return result
                    }
                },
                () => {
                    return async (resolve, parent, args, context, info) => {
                        context.authenticationError = (message?: string) =>
                            new AuthenticationError(
                                message || 'Unauthenticated.'
                            )

                        context.forbiddenError = (message?: string) =>
                            new ForbiddenError(message || 'Forbidden.')

                        context.validationError = (message?: string) =>
                            new ValidationError(message || 'Validation failed.')

                        context.userInputError = (
                            message?: string,
                            properties?: any
                        ) =>
                            new UserInputError(
                                message || 'Invalid user input.',
                                properties
                            )

                        const result = await resolve(
                            parent,
                            args,
                            context,
                            info
                        )

                        return result
                    }
                }
            )

            const resolvers = {
                ...this.getResolversFromGraphqlQueries(
                    currentCtx().graphQlQueries
                ),
                JSON: GraphQLJSON,
                JSONObject: GraphQLJSONObject
            }

            const schema = makeExecutableSchema({
                typeDefs,
                resolvers
            })

            const graphQlServer = new ApolloServer({
                schema: applyMiddleware(
                    schema,
                    ...currentCtx().graphQlMiddleware.map(middlewareGenerator =>
                        middlewareGenerator(
                            currentCtx().graphQlQueries,
                            typeDefs,
                            schema
                        )
                    )
                ),
                ...this.appolloConfig,
                context: ctx => ({
                    ...ctx,
                    ...config,
                    pubsub: this.pubsub,
                    manager: currentCtx().orm?.em?.fork()
                }),
                uploads: false
            })

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
