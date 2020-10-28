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
    PluginSetupConfig,
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

        if (field.property.reference === ReferenceType.ONE_TO_MANY) {

        }

        if (['HasManyField', 'BelongsToManyField'].includes(field.component)) {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            FieldType = `[ID]`
            FieldKey = `${relatedResource?.data.camelCaseNamePlural}`
        }

        if (! field.property.nullable && !isUpdate) {
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

        if (field.property.enum) {
            FieldType = `${resource.data.pascalCaseName}${field.pascalCaseName}Enum`
        }

        if (field.property.type === 'boolean') {
            FieldType = 'Boolean'
        }

        if (['integer', 'bigInteger'].includes(field.property.type!)) {
            FieldType = 'Int'
        }

        console.log(field.property)

        if (field.property.reference === ReferenceType.ONE_TO_MANY || field.property.reference === ReferenceType.MANY_TO_MANY) {
            const relatedResource = resources.find(
                resource => resource.data.name === field.name
            )

            if (relatedResource) {
                FieldType = `[${relatedResource.data.pascalCaseName}]`
                FieldKey = `${
                    relatedResource.data.camelCaseNamePlural
                }(page: Int = 1, per_page: Int = ${
                    relatedResource.data.perPageOptions[0] || 10
                }, filters: [${relatedResource.data.pascalCaseName}Filter])`
            }
        }

        if (field.property.reference === ReferenceType.MANY_TO_ONE) {
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
${resource.data.fields
    .filter(field => field.property.enum)
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
        manager: EntityManager,
        config: PluginSetupConfig
    ) {
        let resolvers: any = {}

        return resolvers
    }

    plugin() {
        return plugin('Graph QL').afterDatabaseSetup(async config => {
            const { app, resources, manager, schemas } = config
            const exposedResources = resources.filter(
                resource => !resource.data.hideFromApi
            )
            console.log(
                JSON.stringify(
                    schemas,
                    null,
                    2
                )
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
                        manager!,
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
