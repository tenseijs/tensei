import { graphqlHTTP } from 'express-graphql'
import parseAst from 'graphql-parse-fields'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
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
    FilterOperators,
    filter
} from '@tensei/common'
import { buildSchema } from 'graphql'
import { EntityManager, ReferenceType } from '@mikro-orm/core'
import GraphqlPlayground from 'graphql-playground-middleware-express'
import { getArgumentValues } from 'graphql/execution/values'

export interface GraphQlPluginConfig {
    graphiql: boolean
    graphqlPath: string
}

const filterOperators: FilterOperators[] = [
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

const topLevelOperators: FilterOperators[] = ['_and', '_or', '_not']

const allOperators = filterOperators.concat(topLevelOperators)

const parseWhereArgumentsToWhereQuery = (whereArgument: any) => {
    if (!whereArgument) {
        return {}
    }
    let whereArgumentString = JSON.stringify(whereArgument)

    allOperators.forEach(operator => {
        whereArgumentString = whereArgumentString.replace(
            `"${operator}"`,
            `"$${operator.split('_')[1]}"`
        )
    })

    return JSON.parse(whereArgumentString)
}

const parseWhereArgumentsFromSelectionToWhereQuery = (selection: any) => {
    const whereArgumentSelection = selection.arguments.find(
        (argument: any) => argument.name.value === 'where'
    )

    if (!whereArgumentSelection) return {}

    console.log(
        whereArgumentSelection,
        JSON.stringify(whereArgumentSelection, null, 2)
    )

    let whereQuery: any = {}

    const populateFieldToWhereQuery = (field: any, previousField: any) => {}

    whereArgumentSelection.fields.forEach((field: any) => {})

    return whereQuery
}

const getFindOptionsFromArgs = (args: any) => {
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

    return findOptions
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
            FieldType = `${resource.data.snakeCaseName}_${field.snakeCaseName}_enum`
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
                FieldKey = `${relatedResource.data.camelCaseNamePlural}(offset: Int, limit: Int, where: ${relatedResource.data.snakeCaseName}_where_query)`
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
                FieldType = `${relatedResource.data.snakeCaseName}`
                FieldKey = relatedResource.data.snakeCaseName
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
  ${resource.data.camelCaseNamePlural}(offset: Int, limit: Int, where: ${resource.data.snakeCaseName}_where_query): [${resource.data.snakeCaseName}]`
    }

    private defineFetchSingleQueryForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `
  ${resource.data.camelCaseName}(${this.getIdKey(config)}: ID!): ${
            resource.data.snakeCaseName
        }`
    }

    getWhereQueryFieldType(field: FieldContract, config: PluginSetupConfig) {
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

            return `${relatedResource?.data.snakeCaseName}_where_query`
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
${resource.data.fields.map(
    field =>
        `${field.databaseField}: ${this.getWhereQueryFieldType(field, config)}`
)}
}
`
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
        enum ${resource.data.snakeCaseName}_${
            field.snakeCaseName
        }_enum {${field.property.items?.map(
            option => `
            ${option}`
        )}
        }`
    )}
type ${resource.data.snakeCaseName} {${resource.data.fields
                .filter(field => !field.isHidden)
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
                .filter(field => !field.property.primary)
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
            }_input {${resource.data.fields.map(field =>
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
        return buildSchema(this.schemaString)
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
        update_${resource.data.snakeCaseNamePlural}(${this.getIdKey(
            config
        )}: ID!, objects: update_${resource.data.snakeCaseName}_input!): [${
            resource.data.snakeCaseName
        }]!
        `
    }

    private defineDeleteMutationForResource(
        resource: ResourceContract,
        config: PluginSetupConfig
    ) {
        return `delete_${resource.data.snakeCaseName}(${this.getIdKey(
            config
        )}: ID!): ${resource.data.snakeCaseName}`
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

        const populateFromResolvedNodes = async (
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

            if (Object.keys(fieldNode).length > 0) {
                const countSelections = Object.keys(
                    fieldNode
                ).filter((selection: string) => selection.match(/__count/))
                const countSelectionNames: string[] = countSelections.map(
                    (selection: string) => selection.split('__')[0]
                )

                const manyToOneSelections = Object.keys(
                    fieldNode
                ).filter((selection: string) =>
                    relatedManyToOneDatabaseFieldNames.includes(selection)
                )
                const manyToManySelections = Object.keys(
                    fieldNode
                ).filter((selection: string) =>
                    relatedManyToManyDatabaseFieldNames.includes(selection)
                )
                const oneToManySelections = Object.keys(
                    fieldNode
                ).filter((selection: string) =>
                    relatedOneToManyDatabaseFieldNames.includes(selection)
                )

                await Promise.all([
                    Promise.all(
                        manyToOneSelections.map((selection: string) =>
                            manager.populate(data, selection)
                        )
                    ),
                    Promise.all(
                        manyToManySelections.map((selection: string) =>
                            (async () => {
                                const field = relatedManyToManyFields.find(
                                    _ => _.databaseField === selection
                                )

                                await Promise.all(
                                    data.map(async item => {
                                        const relatedData: any = await manager.find(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data
                                                    .snakeCaseNamePlural]: {
                                                    id: {
                                                        $in: [item.id]
                                                    }
                                                },
                                                ...parseWhereArgumentsToWhereQuery(
                                                    fieldNode[selection].args
                                                        .where
                                                )
                                            }
                                        )

                                        item[
                                            field?.databaseField!
                                        ] = relatedData
                                    })
                                )
                            })()
                        )
                    ),
                    Promise.all(
                        oneToManySelections.map((selection: string) =>
                            (async () => {
                                await manager.populate(data, selection)

                                const field = relatedOneToManyFields.find(
                                    _ => _.databaseField === selection
                                )

                                await Promise.all(
                                    data.map(async item => {
                                        const relatedData: any = await manager.find(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data.snakeCaseName]:
                                                    item.id,
                                                ...parseWhereArgumentsToWhereQuery(
                                                    fieldNode[selection].args
                                                        .where
                                                )
                                            }
                                        )

                                        item[
                                            field?.databaseField!
                                        ] = relatedData
                                    })
                                )
                            })()
                        )
                    ),
                    Promise.all(
                        countSelectionNames.map(async selection => {
                            if (
                                relatedManyToManyDatabaseFieldNames.includes(
                                    selection
                                )
                            ) {
                                const field = relatedManyToManyFields.find(
                                    _ => _.databaseField === selection
                                )

                                await Promise.all(
                                    data.map(async item => {
                                        const count = await manager.count(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data
                                                    .snakeCaseNamePlural]: {
                                                    id: {
                                                        $in: [item.id]
                                                    }
                                                },
                                                ...parseWhereArgumentsToWhereQuery(
                                                    fieldNode[selection].args
                                                        .where
                                                )
                                            }
                                        )

                                        item[
                                            `${field?.databaseField}__count`
                                        ] = count
                                    })
                                )
                            }

                            if (
                                relatedOneToManyDatabaseFieldNames.includes(
                                    selection
                                )
                            ) {
                                const field = relatedOneToManyFields.find(
                                    _ => _.databaseField === selection
                                )

                                const uniqueKeys = Array.from(
                                    new Set(data.map(_ => _.id))
                                )

                                const counts: any[] = await Promise.all(
                                    uniqueKeys.map(async key =>
                                        manager.count(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data
                                                    .snakeCaseName]: key,
                                                ...parseWhereArgumentsToWhereQuery(
                                                    fieldNode[selection].args
                                                        .where
                                                )
                                            }
                                        )
                                    )
                                )

                                data.forEach(item => {
                                    const index = uniqueKeys.indexOf(item.id)

                                    item[`${field?.databaseField}__count`] =
                                        counts[index]
                                })
                            }
                        })
                    )
                ])

                for (const manyToOneSelection of manyToOneSelections) {
                    const fieldTypes =
                        fieldNode[manyToOneSelection].fieldsByTypeName

                    if (Object.keys(fieldTypes).length > 0) {
                        const field = relatedManyToOneFields.find(
                            f => f.databaseField === manyToOneSelection
                        )!

                        const relatedResource = resources.find(
                            r => r.data.name === field.relatedProperty.type
                        )!

                        await populateFromResolvedNodes(
                            relatedResource,
                            fieldTypes[
                                Object.keys(
                                    fieldNode[manyToOneSelection]
                                        .fieldsByTypeName
                                )[0]
                            ],
                            data.map(d => d[field.databaseField])
                        )
                    }
                }

                for (const manyToManySelection of manyToManySelections) {
                    const fieldTypes =
                        fieldNode[manyToManySelection].fieldsByTypeName

                    if (Object.keys(fieldTypes).length > 0) {
                        const field = relatedManyToManyFields.find(
                            f => f.databaseField === manyToManySelection
                        )!

                        const relatedResource = resources.find(
                            r => r.data.name === field.relatedProperty.type
                        )!

                        await populateFromResolvedNodes(
                            relatedResource,
                            fieldTypes[
                                Object.keys(
                                    fieldNode[manyToManySelection]
                                        .fieldsByTypeName
                                )[0]
                            ],
                            data
                                .map(d => d[field.databaseField])
                                .reduce((acc, d) => [...acc, ...d], [])
                        )
                    }
                }

                for (const oneToManySelection of oneToManySelections) {
                    const fieldTypes =
                        fieldNode[oneToManySelection].fieldsByTypeName

                    if (Object.keys(fieldTypes).length > 0) {
                        const field = relatedOneToManyFields.find(
                            f => f.databaseField === oneToManySelection
                        )!

                        const relatedResource = resources.find(
                            r => r.data.name === field.relatedProperty.type
                        )!

                        await populateFromResolvedNodes(
                            relatedResource,
                            fieldTypes[
                                Object.keys(
                                    fieldNode[oneToManySelection]
                                        .fieldsByTypeName
                                )[0]
                            ],
                            data
                                .map(d => d[field.databaseField])
                                .reduce((acc, d) => [...acc, ...d], [])
                        )
                    }
                }
            }

            return data
        }

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
                const countSelections = fieldNode.selectionSet.selections.filter(
                    (selection: any) => selection.name.value.match(/__count/)
                )
                const countSelectionNames: string[] = countSelections.map(
                    (selection: any) => selection.name.value.split('__')[0]
                )

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
                            (async () => {
                                const field = relatedManyToManyFields.find(
                                    _ =>
                                        _.databaseField === selection.name.value
                                )

                                // console.log('+++++++++++')

                                await Promise.all(
                                    data.map(async item => {
                                        const relatedData: any = await manager.find(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data
                                                    .snakeCaseNamePlural]: {
                                                    id: {
                                                        $in: [item.id]
                                                    }
                                                }
                                                // ...parseWhereArgumentsToWhereQuery(selection.arguments.find((argument: any) => argument.name.value === 'where') || {})
                                            }
                                        )

                                        item[
                                            field?.databaseField!
                                        ] = relatedData
                                    })
                                )
                            })()
                        )
                    ),
                    Promise.all(
                        oneToManySelections.map((selection: any) =>
                            manager.populate(data, selection.name.value)
                        )
                    ),
                    Promise.all(
                        countSelectionNames.map(async selection => {
                            if (
                                relatedManyToManyDatabaseFieldNames.includes(
                                    selection
                                )
                            ) {
                                const field = relatedManyToManyFields.find(
                                    _ => _.databaseField === selection
                                )

                                await Promise.all(
                                    data.map(async item => {
                                        const count = await manager.count(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data
                                                    .snakeCaseNamePlural]: {
                                                    id: {
                                                        $in: [item.id]
                                                    }
                                                }
                                            }
                                        )

                                        item[
                                            `${field?.databaseField}__count`
                                        ] = count
                                    })
                                )
                            }

                            if (
                                relatedOneToManyDatabaseFieldNames.includes(
                                    selection
                                )
                            ) {
                                const field = relatedOneToManyFields.find(
                                    _ => _.databaseField === selection
                                )

                                const uniqueKeys = Array.from(
                                    new Set(data.map(_ => _.id))
                                )

                                const counts: any[] = await Promise.all(
                                    uniqueKeys.map(async key =>
                                        manager.count(
                                            field?.relatedProperty.type!,
                                            {
                                                [resource.data
                                                    .snakeCaseName]: key
                                            }
                                        )
                                    )
                                )

                                data.forEach(item => {
                                    const index = uniqueKeys.indexOf(item.id)

                                    item[`${field?.databaseField}__count`] =
                                        counts[index]
                                })
                            }
                        })
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
            resolvers[resource.data.snakeCaseNamePlural] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any[] = await manager.find(
                    resource.data.pascalCaseName,
                    parseWhereArgumentsToWhereQuery(args.where),
                    getFindOptionsFromArgs(args)
                )

                await populateFromFieldNodes(resource, ql.fieldNodes[0], data)

                return data
            }

            // handle fetch one resolvers
            resolvers[resource.data.snakeCaseName] = async (
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

                const parsedInfo = parseResolveInfo(ql, {
                    keepRoot: false
                }) as any

                // await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])
                await populateFromResolvedNodes(
                    resource,
                    parsedInfo.fieldsByTypeName[parsedInfo.name],
                    [data]
                )

                return data
            }

            resolvers[`insert_${resource.data.snakeCaseName}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data = manager.create(
                    resource.data.pascalCaseName,
                    args.object
                )

                await manager.persistAndFlush(data)
                await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])

                return data
            }

            resolvers[`insert_${resource.data.snakeCaseNamePlural}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any[] = args.objects.map((object: any) =>
                    manager.create(resource.data.pascalCaseName, object)
                )

                await manager.persistAndFlush(data)
                await populateFromFieldNodes(resource, ql.fieldNodes[0], data)

                return data
            }

            resolvers[`update_${resource.data.snakeCaseName}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any = await manager
                    .getRepository<any>(resource.data.pascalCaseName)
                    .findOneOrFail({
                        id: args.id
                    })

                manager.assign(data, args.object)

                await manager.persistAndFlush(data)
                await populateFromFieldNodes(resource, ql.fieldNodes[0], [data])

                return data
            }

            resolvers[`delete_${resource.data.snakeCaseName}`] = async (
                args: any,
                ctx: any,
                ql: any
            ) => {
                const data: any = await manager
                    .getRepository<any>(resource.data.pascalCaseName)
                    .findOneOrFail({
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
            const { app, resources, manager } = config
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
                        manager!.fork(),
                        config
                    )
                }
            })

            app.post(this.config.graphqlPath, graphQLHandler)

            app.get(this.config.graphqlPath, graphQLHandler)

            return {}
        })
    }
}

export const graphql = () => new Graphql()
