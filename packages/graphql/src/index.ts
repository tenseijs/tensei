import { graphqlHTTP } from 'express-graphql'
import { tool, Resource } from '@tensei/common'
import { GraphQLSchema, GraphQLObjectType } from 'graphql'
import GraphqlPlayground from 'graphql-playground-middleware-express'

export interface GraphQlToolConfig {
    graphiql?: boolean
    graphqlPath?: string
}

const generateSchemaFromResources = (resources: Resource[]) => {
    const fields: {
        [key: string]: any
    } = {}

    resources.forEach((resource) => {
        fields[resource.data.slug] = {}
    })

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'RootQueryType',
            fields,
        }),
    })
}

export const graphql = (customConfig?: GraphQlToolConfig) =>
    tool('Graph QL').setup(async ({ app, resources }) => {
        const defaultConfig = {
            graphiql: true,
            graphqlPath: '/graphql',
        }

        const config = {
            ...defaultConfig,
            ...customConfig,
        }

        const schema = generateSchemaFromResources(resources)

        app.post(
            config.graphqlPath,
            graphqlHTTP({
                schema,
                graphiql: false,
            })
        )

        app.get(
            config.graphqlPath,
            GraphqlPlayground({
                endpoint: config.graphqlPath,
            })
        )

        return {}
    })
