import { graphqlHTTP } from 'express-graphql'
import {
    plugin,
    Resource,
    FieldContract,
    Field,
    ResourceContract,
    ManagerContract
} from '@tensei/common'
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLFieldConfig,
    GraphQLID,
    GraphQLEnumType,
    GraphQLType,
    GraphQLEnumValueConfigMap,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLScalarType,
    GraphQLList,
    GraphQLArgs,
    GraphQLFieldConfigArgumentMap,
    GraphQLInputObjectType,
    buildSchema,
    GraphQLNonNull
} from 'graphql'
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

    private getGraphqlFieldDefinition = (
        field: FieldContract,
        resource: ResourceContract,
        resources: ResourceContract[]
    ) => {
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

        if (['integer', 'bigInteger'].includes(field.databaseFieldType)) {
            FieldType = 'Int'
        }

        if (field.component === 'BelongsToField') {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            if (!relatedResource) {
                throw new Error(`Resource ${field.name} does not exist.`)
            }

            FieldType = `${relatedResource.data.pascalCaseName}`
            FieldKey = relatedResource.data.camelCaseName
        }

        if (field.serialize().isRelationshipField) {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            if (!relatedResource) {
                throw new Error(`Resource ${field.name} does not exist.`)
            }

            if (
                ['HasManyField', 'BelongsToManyField'].includes(field.component)
            ) {
                FieldType = `[${relatedResource.data.pascalCaseName}]`
                FieldKey = `${
                    relatedResource.data.camelCaseNamePlural
                }(page: Int = 1, per_page: Int = ${
                    relatedResource.data.perPageOptions[0] || 10
                }, filters: [${relatedResource.data.pascalCaseName}Filter])`
            }
        }

        if (
            !field.serialize().isNullable ||
            field.databaseFieldType === 'increments'
        ) {
            FieldType = `${FieldType}!`
        }

        return `
  ${FieldKey}: ${FieldType}`
    }

    private defineFetchAllQueryForResource(resource: ResourceContract) {
        return `
  ${resource.data.camelCaseNamePlural}(page: Int = 1, per_page: Int = ${
            resource.data.perPageOptions[0] || 10
        }, filters: [${resource.data.pascalCaseName}Filter]): [${
            resource.data.pascalCaseName
        }]`
    }

    private defineFetchSingleQueryForResource(resource: ResourceContract) {
        return `
  ${resource.data.camelCaseName}(id: ID!): ${resource.data.pascalCaseName}`
    }

    getFieldsTypeDefinition(resource: ResourceContract) {
        return resource.data.fields
            .filter(
                field =>
                    !field.isHidden && !field.serialize().isRelationshipField
            )
            .map(field => {
                return `
  ${field.databaseField}`
            })
    }

    private setupResourceGraphqlTypes(resources: ResourceContract[]) {
        resources.forEach(resource => {
            this.schemaString = `${this.schemaString}
type ${resource.data.pascalCaseName} {${resource.data.fields
                .filter(field => !field.isHidden)
                .map(field =>
                    this.getGraphqlFieldDefinition(field, resource, resources)
                )}
}
enum ${resource.data.pascalCaseName}FieldsEnum {${this.getFieldsTypeDefinition(
                resource
            )}
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
${resource.data.fields
    .filter(field => field.databaseFieldType === 'enu')
    .map(
        field => `
enum ${resource.data.pascalCaseName}${
            field.pascalCaseName
        }Enum {${field.serialize().selectOptions?.map(
            option => `
  ${option.value}`
        )}
}`
    )}
`
        })

        this.schemaString = `${this.schemaString}type Query {${resources.map(
            resource => {
                return `${this.defineFetchSingleQueryForResource(
                    resource
                )}${this.defineFetchAllQueryForResource(resource)}`
            }
        )}
}
`
        // console.log(this.schemaString)
        return buildSchema(this.schemaString)
    }

    private getResolvers(
        resources: ResourceContract[],
        manager: ManagerContract['setResource']
    ) {
        let resolvers: any = {}

        const getSingleResource = async (
            resource: ResourceContract,
            relatedResource: ResourceContract,
            field: FieldContract,
            row: any
        ) => {
            const relatedRow = await manager(relatedResource)
                .database()
                .findOneById(row[field.databaseField])

            let relatedRowJson = relatedRow.toJSON()

            relatedRowJson = populateRowWithRelationShips(relatedRowJson, relatedResource)

            return relatedRowJson
        }

        const populateRowWithRelationShips = (row:any, resource: ResourceContract) => {
            resource.data.fields.forEach(field => {
                if (field.component === 'BelongsToField') {
                    const relatedResource = resources.find(
                        r => r.data.name === field.name
                    )!

                    row[
                        relatedResource.data.camelCaseName
                    ] = () =>
                        getSingleResource(
                            resource,
                            relatedResource,
                            field,
                            row
                        )
                }

                if (
                    ['BelongsToManyField', 'HasManyField'].includes(
                        field.component
                    )
                ) {
                    const relatedResource = resources.find(
                        resource => resource.data.name === field.name
                    )!

                    row[
                        relatedResource.data.camelCaseNamePlural
                    ] = (relatedArgs: any) =>
                        getMultipleResources(
                            resource,
                            relatedResource,
                            field,
                            row,
                            relatedArgs
                        )
                }
            })

            return row
        }

        const getMultipleResources = async (
            resource: ResourceContract,
            relatedResource: ResourceContract,
            field: FieldContract,
            row: any,
            args: any
        ) => {
            let rows: any = {
                data: []
            }

            if (field.component === 'BelongsToManyField') {
                rows = await manager(resource.data.name)
                    .database()
                    .findAllBelongingToMany(relatedResource, row.id, args)
            } else {
                let relatedBelongsToField = relatedResource.data.fields.find(
                    field => field.name === resource.data.name
                )

                rows = await manager(relatedResource)
                    .database()
                    .findAll({
                        ...args,
                        filters: [
                            ...(args.filters || []),
                            {
                                field: relatedBelongsToField?.databaseField,
                                value: row.id,
                                operator: 'equals'
                            }
                        ]
                    })
            }

            return rows.data.map((row: any) => {
                let result = {
                    ...row.toJSON()
                }

                result = populateRowWithRelationShips(result, relatedResource)

                return result
            })
        }

        resources.forEach(resource => {
            // handle fetch all resolvers
            resolvers[resource.data.camelCaseNamePlural] = async (
                args: any,
                request: any,
                ql: any
            ) => {
                const resourceManager = manager(resource.data.name)

                // console.log(ql.fieldNodes[0].selectionSet.selections[3])

                const data = await resourceManager.database().findAll(args)

                return data.data.map(row => {
                    let result = {
                        ...row
                    }

                    result = populateRowWithRelationShips(result, resource)

                    return result
                })
            }

            // handle fetch one resolvers
            resolvers[resource.data.camelCaseName] = async (args: any) => {
                const resourceManager = manager(resource.data.name)

                const data = await resourceManager
                    .database()
                    .findOneById(args.id)

                let result = {
                    ...data.toJSON()
                }

                resource.data.fields.forEach(field => {
                    if (field.component === 'BelongsToField') {
                        const relatedResource = resources.find(
                            r => r.data.name === field.name
                        )!

                        result[relatedResource.data.camelCaseName] = () =>
                            getSingleResource(
                                resource,
                                relatedResource,
                                field,
                                result
                            )
                    }

                    if (
                        ['BelongsToManyField', 'HasManyField'].includes(
                            field.component
                        )
                    ) {
                        const relatedResource = resources.find(
                            r => r.data.name === field.name
                        )!

                        result[relatedResource.data.camelCaseNamePlural] = (
                            relatedArgs: any
                        ) =>
                            getMultipleResources(
                                relatedResource,
                                relatedResource,
                                field,
                                result,
                                relatedArgs
                            )
                    }
                })

                return result
            }
        })

        return resolvers
    }

    plugin() {
        return plugin('Graph QL').afterDatabaseSetup(
            async ({ app, resources, manager }) => {
                const exposedResources = resources.filter(
                    resource => !resource.data.hideFromApi
                )
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
