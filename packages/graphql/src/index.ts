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
import { EntityManager, ReferenceType } from '@mikro-orm/core'
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

        if (field.property.enum) {
            FieldType = `${resource.data.pascalCaseName}${field.pascalCaseName}Enum`
        }

        if (['integer', 'bigInteger'].includes(field.property.type!)) {
            FieldType = 'Int'
        }

        if (field.databaseFieldType === 'boolean') {
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
                FieldKey = `${
                    relatedResource.data.camelCaseNamePlural
                }(page: Int = 1, perPage: Int = ${
                    relatedResource.data.perPageOptions[0] || 10
                })`
            }
        }

        if (field.property.type === 'Date') {
            FieldType = 'String'
        }

        if (field.relatedProperty.reference === ReferenceType.MANY_TO_ONE) {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            if (relatedResource) {
                FieldType = `${relatedResource.data.pascalCaseName}`
                FieldKey = relatedResource.data.camelCaseName
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
  ${resource.data.camelCaseNamePlural}(page: Int = 1, perPage: Int = ${
            resource.data.perPageOptions[0] || 10
        }): [${resource.data.pascalCaseName}]`
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
${resource.data.fields
    .filter(field => field.property.enum)
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
            }Input {${resource.data.fields.filter(field => ! field.property.primary).map(field =>
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
        )}: ID!): ${resource.data.pascalCaseName}`
    }

    private getIdKey(config: PluginSetupConfig) {
        return 'id'
    }

    private getResolvers(
        resources: ResourceContract[],
        manager: EntityManager,
        config: PluginSetupConfig
    ) {
        let resolvers: any = {}

        const populateFromFieldNodes = async (
            resource: ResourceContract,
            fieldNode: any,
            data: any[]
        ) => {
            const relationshipFields = resource.data.fields.filter(
                f => f.relatedProperty.reference
            )

            const relatedManyToOneFields = relationshipFields.filter(
                field =>
                    field.relatedProperty.reference ===
                    ReferenceType.MANY_TO_ONE
            )
            const relatedManyToManyFields = relationshipFields.filter(
                field =>
                    field.relatedProperty.reference ===
                    ReferenceType.MANY_TO_MANY
            )
            const relatedOneToManyFields = relationshipFields.filter(
                field =>
                    field.relatedProperty.reference ===
                    ReferenceType.ONE_TO_MANY
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

            if (fieldNode.selectionSet) {
                const manyToOneSelections = fieldNode.selectionSet.selections.filter(
                    (selection: any) =>
                        relatedManyToOneDatabaseFieldNames.includes(
                            selection.name.value
                        )
                )
                const manyToManySelections = fieldNode.selectionSet.selections.filter(
                    (selection: any) =>
                        relatedManyToManyDatabaseFieldNames.includes(
                            selection.name.value
                        )
                )
                const oneToManySelections = fieldNode.selectionSet.selections.filter(
                    (selection: any) =>
                        relatedOneToManyDatabaseFieldNames.includes(
                            selection.name.value
                        )
                )

                await Promise.all([
                    Promise.all(
                        manyToOneSelections.map((selection: any) =>
                            manager.populate(data, selection.name.value)
                        )
                    ),
                    Promise.all(
                        manyToManySelections.map((selection: any) =>
                            manager.populate(data, selection.name.value)
                        )
                    ),
                    Promise.all(
                        oneToManySelections.map((selection: any) =>
                            manager.populate(data, selection.name.value)
                        )
                    )
                ])

                for (const manyToOneSelection of manyToOneSelections) {
                    if (manyToOneSelection.selectionSet) {
                        const field = relatedManyToOneFields.find(
                            f =>
                                f.databaseField ===
                                manyToOneSelection.name.value
                        )!

                        const relatedResource = resources.find(
                            r => r.data.name === field.relatedProperty.type
                        )!

                        await populateFromFieldNodes(
                            relatedResource,
                            manyToOneSelection,
                            data.map(d => d[field.databaseField])
                        )
                    }
                }

                for (const manyToManySelection of manyToManySelections) {
                    if (manyToManySelection.selectionSet) {
                        const field = relatedManyToManyFields.find(
                            f =>
                                f.databaseField ===
                                manyToManySelection.name.value
                        )!

                        const relatedResource = resources.find(
                            r => r.data.name === field.relatedProperty.type
                        )!

                        await populateFromFieldNodes(
                            relatedResource,
                            manyToManySelection,
                            data
                                .map(d => d[field.databaseField])
                                .reduce((acc, d) => [...acc, ...d], [])
                        )
                    }
                }

                for (const oneToManySelection of oneToManySelections) {
                    if (oneToManySelection.selectionSet) {
                        const field = relatedOneToManyFields.find(
                            f =>
                                f.databaseField ===
                                oneToManySelection.name.value
                        )!

                        const relatedResource = resources.find(
                            r => r.data.name === field.relatedProperty.type
                        )!

                        await populateFromFieldNodes(
                            relatedResource,
                            oneToManySelection,
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
            // handle fetch all resolvers
            resolvers[resource.data.camelCaseNamePlural] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any[] = await manager.find(
                    resource.data.name,
                    {},
                    {
                        limit: args.perPage,
                        offset: (args.page - 1) * args.perPage //TODO: Make sure this cannot crash.
                    }
                )

                await populateFromFieldNodes(resource, ql.fieldNodes[0], data)

                return data
            }

            // handle fetch one resolvers
            resolvers[resource.data.camelCaseName] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any = await manager.findOneOrFail(
                    resource.data.pascalCaseName,
                    {
                        id: args.id
                    }
                )

                await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])

                return data
            }

            resolvers[`create${resource.data.pascalCaseName}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data = manager.create(resource.data.pascalCaseName, args.input)

                await manager.persistAndFlush(data)
                await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])

                return data
            }

            resolvers[`update${resource.data.pascalCaseName}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any = await manager.getRepository<any>(resource.data.pascalCaseName).findOneOrFail({
                    id: args.id
                })
                
                manager.assign(data, args.input)
                
                console.log(data)
                await manager.persistAndFlush(data)
                await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])

                return data
            }

            resolvers[`delete${resource.data.pascalCaseName}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any = await manager.getRepository<any>(resource.data.pascalCaseName).findOneOrFail({
                    id: args.id
                })

                await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])
                await manager.removeAndFlush(data)

                return data
            }
        })

        return resolvers
    }

    plugin() {
        return plugin('Graph QL').afterDatabaseSetup(async config => {
            const { app, resources, manager, schemas } = config
            const exposedResources = resources.filter(
                resource => !resource.data.hideFromApi
            )

            const schema = this.setupResourceGraphqlTypes(
                exposedResources,
                config
            )

            const graphQLHandler = graphqlHTTP((req, res, params) => {
                return {
                    schema,
                    pretty: true,
                    graphiql: this.config.graphiql,
                    rootValue: this.getResolvers(
                        exposedResources,
                        manager!,
                        config
                    )
                }
            })

            app.post(
                this.config.graphqlPath,
                graphQLHandler
            )

            app.get(
                this.config.graphqlPath,
                graphQLHandler
            )

            return {}
        })
    }
}

export const graphql = () => new Graphql()
