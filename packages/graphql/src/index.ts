import { graphqlHTTP } from 'express-graphql'
import { plugin, Resource, FieldContract, Field, ResourceContract, ManagerContract } from '@tensei/common'
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFieldConfig, GraphQLID, GraphQLEnumType, GraphQLType, GraphQLEnumValueConfigMap, GraphQLBoolean, GraphQLInt, GraphQLScalarType, GraphQLList, GraphQLArgs, GraphQLFieldConfigArgumentMap, GraphQLInputObjectType, buildSchema, GraphQLNonNull } from 'graphql'
import GraphqlPlayground from 'graphql-playground-middleware-express'

import { FilterGraphqlTypes } from './Filters'

export interface GraphQlPluginConfig {
    graphiql: boolean
    graphqlPath: string
}

class Graphql {
    private config: GraphQlPluginConfig = {
        graphiql: true,
        graphqlPath: '/graphql'
    }

    schemaString: string = ''

    private getGraphqlFieldDefinition = (field: FieldContract, resource: ResourceContract, resources: ResourceContract[]) => {
        let FieldType = 'String'
        let FieldKey = field.databaseField

        if (field.databaseFieldType === 'increments') {
            FieldType = 'ID'
        }

        if (field.databaseFieldType === 'enu') {
            FieldType = `${resource.data.pascalCaseName}${field.pascalCaseName}Enum`
        }

        if (field.databaseFieldType === 'boolean') {
            FieldType = 'Boolean'
        }

        if (
            ['integer', 'bigInteger'].includes(field.databaseFieldType)
        ) {
            FieldType = 'Int'
        }

        if (field.component === 'BelongsToField') {
            const relatedResource = resources.find(resource => resource.data.name === field.name)

            if (! relatedResource) {
                throw new Error(`Resource ${field.name} does not exist.`)
            }

            FieldType = `${relatedResource.data.pascalCaseName}`
            FieldKey = relatedResource.data.camelCaseName
        }


        if (field.serialize().isRelationshipField) {
            const relatedResource = resources.find(resource => resource.data.name === field.name)

            if (! relatedResource) {
                throw new Error(`Resource ${field.name} does not exist.`)
            }

            if (field.component === 'HasManyField') {
                FieldType = `[${relatedResource.data.pascalCaseName}]`
                FieldKey = `${relatedResource.data.camelCaseNamePlural}`
            }

            if (field.component === 'BelongsToManyField') {
                FieldType = `[${relatedResource.data.pascalCaseName}]`
                FieldKey = `${relatedResource.data.camelCaseNamePlural}`
            }
        }

        if (field.validationRules.includes('required') || field.databaseFieldType === 'increments') {
            FieldType = `${FieldType}!`
        }

        return `
  ${FieldKey}: ${FieldType}`
    }

    private defineFetchAllQueryForResource(resource: ResourceContract) {
return `
  ${resource.data.camelCaseNamePlural}(page: Int = 1, perPage: Int = ${resource.data.perPageOptions[0] || 10}, filters: [${resource.data.pascalCaseName}Filter]): [${resource.data.pascalCaseName}!]!`
    }

    private defineFetchSingleQueryForResource(resource: ResourceContract) {
        return `
  ${resource.data.camelCaseName}(id: ID!): ${resource.data.pascalCaseName}`
    }

    private setupResourceGraphqlTypes (resources: ResourceContract[]) {
        resources.forEach(resource => {
            this.schemaString = `${this.schemaString}
type ${resource.data.pascalCaseName} {${resource.data.fields.filter(field => ! field.isHidden).map(field => this.getGraphqlFieldDefinition(field, resource, resources))}
}
enum ${resource.data.pascalCaseName}FieldsEnum {${FilterGraphqlTypes.getFieldsTypeDefinition(resource)}
}
enum ${resource.data.pascalCaseName}FilterOperators {
  equals
  contains
  not_equals
  is_null
  not_null
  gt
  gte
  lt
  lte
  matches
  in
  not_in
}
input ${resource.data.pascalCaseName}Filter {
  field: ${resource.data.pascalCaseName}FieldsEnum
  value: [String]
  operator: ${resource.data.pascalCaseName}FilterOperators
}
${resource.data.fields.filter(field => field.databaseFieldType === 'enu').map(field => `
enum ${resource.data.pascalCaseName}${field.pascalCaseName}Enum {${field.serialize().selectOptions?.map(option => `
  ${option.value}`)}
}`)}
`
        })

this.schemaString = `${this.schemaString}type Query {${resources.map(resource => {
    return `${this.defineFetchSingleQueryForResource(resource)}${this.defineFetchAllQueryForResource(resource)}`
})}
}
`
console.log(this.schemaString)
        return buildSchema(this.schemaString)
    }

    private getResolvers(resources: ResourceContract[], manager: ManagerContract['setResource']) {
        let resolvers: any = {}
    
        resources.forEach(resource => {
            // handle fetch all resolvers
            resolvers[resource.data.camelCaseNamePlural] = async (args: any) => {
                const resourceManager = manager(resource.data.name)

                const data = await resourceManager.database().findAll(args)

                return data.data.map(row => {
                    let result = {
                        ...row
                    }

                    resource.data.fields.forEach(field => {
                        if (field.component === 'BelongsToField') {
                            const relatedResource = resources.find(resource => resource.data.name === field.name)!

                            result[relatedResource.data.camelCaseName] = async () => {
                                const relatedRow = await manager(relatedResource.data.name).database().findOneById(row[field.databaseField])

                                return relatedRow.toJSON()
                            }
                        }
                    })

                    return result
                })
            }

            // handle fetch one resolvers
            resolvers[resource.data.camelCaseName] = async (...all: any) => {
                console.log('______________ RESOLVER', all)

                return []
            }
        })

        return resolvers
    }

    plugin() {
        return plugin('Graph QL').afterDatabaseSetup(
            async ({ app, resources, manager }) => {
                const exposedResources = resources.filter(resource => ! resource.data.hideFromApi)
                const schema = this.setupResourceGraphqlTypes(exposedResources)

                app.post(
                    this.config.graphqlPath,
                    graphqlHTTP({
                        schema,
                        graphiql: this.config.graphiql,
                        rootValue: this.getResolvers(exposedResources, manager)
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
