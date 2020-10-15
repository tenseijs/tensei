import { graphqlHTTP } from 'express-graphql'
import DataLoader from 'dataloader'
import {
    plugin,
    Resource,
    FieldContract,
    Field,
    ResourceContract,
    ManagerContract,
    DataPayload,
    belongsTo,
    PluginSetupConfig
} from '@tensei/common'
import { buildSchema } from 'graphql'
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

    schemaString: string = ''

    private getGraphqlFieldDefinitionForCreateInput = (
        field: FieldContract,
        resource: ResourceContract,
        resources: ResourceContract[],
        isUpdate?: boolean
    ) => {
        let FieldType = 'String'
        let FieldKey = field.databaseField

        if (field.databaseFieldType === 'increments') {
            return ``
        }

        if (['integer', 'bigInteger'].includes(field.databaseFieldType)) {
            FieldType = 'Int'
        }

        if (field.databaseFieldType === 'boolean') {
            FieldType = 'Boolean'
        }

        if (field.component === 'BelongsToField') {
            FieldType = 'ID'
            FieldKey = `${field.databaseField}`
        }

        if (['HasManyField', 'BelongsToManyField'].includes(field.component)) {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            FieldType = `[ID]`
            FieldKey = `${relatedResource?.data.camelCaseNamePlural}`
        }

        if (!field.serialize().isNullable && !isUpdate) {
            FieldType = `${FieldType}!`
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

        if (field.databaseFieldType === 'increments') {
            FieldType = 'ID'

            if (config.database === 'mongodb') {
                FieldKey = 'id'
            }
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

    private defineFetchAllQueryForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `
  ${resource.data.camelCaseNamePlural}(page: Int = 1, per_page: Int = ${
            resource.data.perPageOptions[0] || 10
        }, filters: [${resource.data.pascalCaseName}Filter]): [${
            resource.data.pascalCaseName
        }]`
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

    private getRelatedFieldsCountDefinition(
        field: FieldContract,
        resource: ResourceContract,
        resources: ResourceContract[]
    ) {
        return ``
    }

    private setupResourceGraphqlTypes(
        resources: ResourceContract[],
        config: PluginSetupConfig
    ) {
        resources.forEach(resource => {
            this.schemaString = `${this.schemaString}
type ${resource.data.pascalCaseName} {${resource.data.fields
                .filter(field => !field.isHidden)
                .map(field =>
                    this.getGraphqlFieldDefinition(
                        field,
                        resource,
                        resources,
                        config
                    )
                )}
}
input create${
                resource.data.pascalCaseName
            }Input {${resource.data.fields.map(field =>
                this.getGraphqlFieldDefinitionForCreateInput(
                    field,
                    resource,
                    resources
                )
            )}
}

input update${
                resource.data.pascalCaseName
            }Input {${resource.data.fields.map(field =>
                this.getGraphqlFieldDefinitionForCreateInput(
                    field,
                    resource,
                    resources,
                    true
                )
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
                    resource,
                    config
                )}${this.defineFetchAllQueryForResource(resource, config)}`
            }
        )}
}
`
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
type DeletePayload {
    success: Boolean!
}
`

        return buildSchema(this.schemaString)
    }

    private defineCreateMutationForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `create${resource.data.pascalCaseName}(input: create${resource.data.pascalCaseName}Input!): ${resource.data.pascalCaseName}!`
    }

    private defineUpdateMutationForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `update${resource.data.pascalCaseName}(${this.getIdKey(
            config
        )}: ID!, input: update${resource.data.pascalCaseName}Input!): ${
            resource.data.pascalCaseName
        }!`
    }

    private defineDeleteMutationForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `delete${resource.data.pascalCaseName}(${this.getIdKey(
            config
        )}: ID!): DeletePayload!`
    }

    private getIdKey(config: PluginSetupConfig) {
        return 'id'
    }

    private getResolvers(
        resources: ResourceContract[],
        manager: ManagerContract['setResource'],
        config: PluginSetupConfig
    ) {
        let resolvers: any = {}

        const getSingleResource = async (
            resource: ResourceContract,
            field: FieldContract,
            row: any
        ) => {
            let relatedRowJson = await manager(resource)
                .database()
                .findOneById(row[field.databaseField])

            const [result] = populateRowWithRelationShips(
                [relatedRowJson],
                resource
            )

            return result
        }

        const populateRowWithRelationShips = (
            rows: any[],
            resource: ResourceContract
        ) => {
            const belongsToFields = resource.data.fields.filter(
                field => field.component === 'BelongsToField'
            )
            let belongsToDataLoaders: DataPayload = {}

            belongsToFields.forEach(belongsToField => {
                const relatedBelongsToResource = resources.find(
                    r => r.data.name === belongsToField.name
                )!

                belongsToDataLoaders[
                    `${resource.data.pascalCaseName}_${relatedBelongsToResource.data.pascalCaseName}_BelongsToField`
                ] = new DataLoader(async (keys: readonly string[]) => {
                    const keysWithoutDuplicates = Array.from(
                        new Set(keys.map(key => key.toString()))
                    )

                    const rows = await manager(relatedBelongsToResource!)
                        .database()
                        .findAllByIds(keysWithoutDuplicates)

                    return populateRowWithRelationShips(
                        keys.map(key =>
                            rows.find(row =>
                                [
                                    row[this.getIdKey(config)].toString()
                                ].includes(key.toString())
                            )
                        ),
                        relatedBelongsToResource!
                    )
                })
            })

            const relationshipFields = resource.data.fields.filter(
                f =>
                    f.serialize().isRelationshipField ||
                    f.component === 'BelongsToField'
            )

            return rows.map(row => {
                relationshipFields.forEach(field => {
                    if (field.component === 'BelongsToField') {
                        const relatedResource = resources.find(
                            r => r.data.name === field.name
                        )!

                        const loader =
                            belongsToDataLoaders[
                                `${resource.data.pascalCaseName}_${relatedResource.data.pascalCaseName}_BelongsToField`
                            ]

                        const relatedId = row[field.databaseField]

                        if (relatedId && typeof relatedId !== 'function') {
                            row[relatedResource.data.camelCaseName] = () =>
                                loader.load(relatedId)
                        }

                        return
                    }

                    if (
                        ['BelongsToManyField', 'HasManyField'].includes(
                            field.component
                        )
                    ) {
                        const relatedResource = resources.find(
                            resource => resource.data.name === field.name
                        )!

                        row[relatedResource.data.camelCaseNamePlural] = (
                            relatedArgs: any
                        ) =>
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
            })
        }

        const getMultipleResources = async (
            resource: ResourceContract,
            relatedResource: ResourceContract,
            field: FieldContract,
            row: any,
            args: any
        ) => {
            let rows: any = []

            if (field.component === 'BelongsToManyField') {
                rows = await manager(resource)
                    .database()
                    .findAllBelongingToManyData(relatedResource, row.id, args)
            } else {
                rows = await manager(resource)
                    .database()
                    .findAllHasManyData(relatedResource, row.id, args)
            }

            return populateRowWithRelationShips(rows, relatedResource)
        }

        resources.forEach(resource => {
            // handle fetch all resolvers
            resolvers[resource.data.camelCaseNamePlural] = async (
                args: any,
                request: any,
                ql: any
            ) => {
                const resourceManager = manager(resource.data.name)

                const data = await resourceManager.database().findAllData(args)

                return populateRowWithRelationShips(data, resource)
            }

            // handle fetch one resolvers
            resolvers[resource.data.camelCaseName] = async (args: any) => {
                const resourceManager = manager(resource.data.name)

                let data = await resourceManager
                    .database()
                    .findOneById(args.id || args._id)

                const [result] = populateRowWithRelationShips([data], resource)

                return result
            }

            resolvers[`create${resource.data.pascalCaseName}`] = async (
                args: any
            ) => {
                const resourceManager = manager(resource.data.name)

                let data = await resourceManager.create(args.input)

                const [result] = populateRowWithRelationShips([data], resource)

                return result
            }

            resolvers[`update${resource.data.pascalCaseName}`] = async (
                args: any
            ) => {
                const resourceManager = manager(resource.data.name)

                let data = await resourceManager.update(
                    args.id || args._id,
                    args.input
                )

                const [result] = populateRowWithRelationShips([data], resource)

                return result
            }

            resolvers[`delete${resource.data.pascalCaseName}`] = async (
                args: any
            ) => {
                const resourceManager = manager(resource.data.name)

                const success = await resourceManager.deleteById(
                    args.id || args._id
                )

                return {
                    success
                }
            }
        })

        return resolvers
    }

    plugin() {
        return plugin('Graph QL').afterDatabaseSetup(async config => {
            const { app, resources, manager, database } = config
            const exposedResources = resources.filter(
                resource => !resource.data.hideFromApi
            )
            const schema = this.setupResourceGraphqlTypes(
                exposedResources,
                config
            )

            app.post(
                this.config.graphqlPath,
                graphqlHTTP({
                    schema,
                    graphiql: this.config.graphiql,
                    rootValue: this.getResolvers(
                        exposedResources,
                        manager,
                        config
                    )
                })
            )

            app.get(
                this.config.graphqlPath,
                GraphqlPlayground({
                    endpoint: this.config.graphqlPath
                })
            )

            return {}
        })
    }
}

export const graphql = () => new Graphql()
