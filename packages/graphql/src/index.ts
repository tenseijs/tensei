import { graphqlHTTP } from 'express-graphql'
import { plugin, Resource } from '@tensei/common'
import { GraphQLSchema, GraphQLObjectType } from 'graphql'
import GraphqlPlayground from 'graphql-playground-middleware-express'

export interface GraphQlPluginConfig {
    graphiql: boolean
    graphqlPath: string
}

class Graphql {
    private config: GraphQlPluginConfig = {
        graphiql: true,
        graphqlPath: '/graphql'
    }

    generateSchemaFromResources = (resources: Resource[]) => {
        const fields: {
            [key: string]: any
        } = {}

        resources.forEach(resource => {
            fields[resource.data.slug] = {}
        })

        return new GraphQLSchema({
            query: new GraphQLObjectType({
                name: 'RootQueryType',
                fields
            })
        })
    }

    plugin() {
        return plugin('Graph QL').afterDatabaseSetup(
            async ({ app, resources }) => {
                const schema = this.generateSchemaFromResources(resources)

                app.post(
                    this.config.graphqlPath,
                    graphqlHTTP({
                        schema,
                        graphiql: this.config.graphiql
                    })
                )

                app.get(
                    this.config.graphqlPath,
                    GraphqlPlayground({
                        endpoint: this.config.graphqlPath
                    })
                )

                return {}
            }
        )
    }
}

export const graphql = () => new Graphql()
