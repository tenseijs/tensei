import { applyMiddleware } from 'graphql-middleware'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import {
    ApolloServer,
    gql,
    Config as ApolloConfig,
    makeExecutableSchema,
    AuthenticationError,
    ForbiddenError,
    ValidationError,
    UserInputError,
    GetMiddlewareOptions
} from 'apollo-server-express'
import {
    plugin,
    FieldContract,
    ResourceContract,
    PluginSetupConfig,
    FilterOperators,
    GraphQLPluginExtension,
    Resolvers,
    graphQlQuery,
    GraphQlMiddleware,
    GraphQlQueryContract
} from '@tensei/common'
import { EntityManager, ReferenceType } from '@mikro-orm/core'

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

const getParsedInfo = (ql: any) => {
    const parsedInfo = parseResolveInfo(ql, {
        keepRoot: false
    }) as any

    return parsedInfo.fieldsByTypeName[
        Object.keys(parsedInfo.fieldsByTypeName)[0]
    ]
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

type OmittedApolloConfig = Omit<ApolloConfig, 'typeDefs' | 'resolvers'>

class Graphql {
    private pluginExtensions: GraphQLPluginExtension[] = []

    private appolloConfig: OmittedApolloConfig = {}

    private getMiddlewareOptions: GetMiddlewareOptions = {}

    schemaString: string = ''

    private resolvers: GraphQlQueryContract[] = []

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
                FieldKey = `${relatedResource.data.snakeCaseNamePlural}(offset: Int, limit: Int, where: ${relatedResource.data.snakeCaseName}_where_query)`
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

    private getResolvers(resources: ResourceContract[]) {
        const resolversList: GraphQlQueryContract[] = []

        const populateFromResolvedNodes = async (
            manager: EntityManager,
            resource: ResourceContract,
            fieldNode: any,
            data: any[]
        ) => {
            if (!data.length) return

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

                                if (
                                    !fieldNode[selection].args.where &&
                                    !fieldNode[selection].args.limit &&
                                    !fieldNode[selection].args.offset
                                ) {
                                    await manager.populate(data, selection)

                                    return
                                }

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
                                            },
                                            getFindOptionsFromArgs(
                                                fieldNode[selection].args
                                            )
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
                                if (
                                    !fieldNode[selection].args.where &&
                                    !fieldNode[selection].args.limit &&
                                    !fieldNode[selection].args.offset
                                ) {
                                    await manager.populate(data, selection)

                                    return
                                }

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
                                            },
                                            getFindOptionsFromArgs(
                                                fieldNode[selection].args
                                            )
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
                                                    fieldNode[
                                                        `${selection}__count`
                                                    ].args.where
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
                                                    fieldNode[
                                                        `${selection}__count`
                                                    ].args.where
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
                            manager,
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
                            manager,
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
                            manager,
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

        resources.forEach(resource => {
            resolversList.push(
                graphQlQuery(`Fetch ${resource.data.snakeCaseNamePlural}`)
                    .path(resource.data.snakeCaseNamePlural)
                    .query()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data: any[] = await ctx.manager.find(
                            resource.data.pascalCaseName,
                            parseWhereArgumentsToWhereQuery(args.where),
                            getFindOptionsFromArgs(args)
                        )

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            data
                        )

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(`Fetch single ${resource.data.snakeCaseName}`)
                    .path(resource.data.snakeCaseName)
                    .query()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data: any = await ctx.manager.findOneOrFail(
                            resource.data.pascalCaseName,
                            {
                                id: args.id
                            }
                        )

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            [data]
                        )

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(`Insert single ${resource.data.snakeCaseName}`)
                    .path(`insert_${resource.data.snakeCaseName}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data = ctx.manager.create(
                            resource.data.pascalCaseName,
                            args.object
                        )

                        await ctx.manager.persistAndFlush(data)

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            [data]
                        )

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(
                    `Insert multiple ${resource.data.snakeCaseNamePlural}`
                )
                    .path(`insert_${resource.data.snakeCaseNamePlural}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data: any[] = args.objects.map((object: any) =>
                            ctx.manager.create(
                                resource.data.pascalCaseName,
                                object
                            )
                        )

                        await ctx.manager.persistAndFlush(data)

                        await ctx.manager.persistAndFlush(data)

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            data
                        )

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(`Update single ${resource.data.snakeCaseName}`)
                    .path(`update_${resource.data.snakeCaseName}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data: any = await ctx.manager
                            .getRepository<any>(resource.data.pascalCaseName)
                            .findOneOrFail(args.id)

                        ctx.manager.assign(data, args.object)

                        await ctx.manager.persistAndFlush(data)

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            [data]
                        )

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(
                    `Update multiple ${resource.data.snakeCaseNamePlural}`
                )
                    .path(`update_${resource.data.snakeCaseNamePlural}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data = await ctx.manager.find(
                            resource.data.pascalCaseName,
                            parseWhereArgumentsToWhereQuery(args.where)
                        )

                        data.forEach(d => ctx.manager.assign(d, args.object))

                        await ctx.manager.persistAndFlush(data)

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            data
                        )

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(`Delete single ${resource.data.snakeCaseName}`)
                    .path(`delete_${resource.data.snakeCaseName}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data: any = await ctx.manager
                            .getRepository<any>(resource.data.pascalCaseName)
                            .findOneOrFail(args.id)

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            [data]
                        )

                        await ctx.manager.removeAndFlush(data)

                        return data
                    })
            )

            resolversList.push(
                graphQlQuery(
                    `Delete multiple ${resource.data.snakeCaseNamePlural}`
                )
                    .path(`delete_${resource.data.snakeCaseNamePlural}`)
                    .mutation()
                    .internal()
                    .resource(resource)
                    .handle(async (_, args, ctx, info) => {
                        const data = await ctx.manager.find(
                            resource.data.pascalCaseName,
                            parseWhereArgumentsToWhereQuery(args.where)
                        )

                        await populateFromResolvedNodes(
                            ctx.manager,
                            resource,
                            getParsedInfo(info),
                            data
                        )

                        await ctx.manager.removeAndFlush(data)

                        return data
                    })
            )
        })

        return resolversList
    }

    extensions(extensions: GraphQLPluginExtension[]) {
        this.pluginExtensions = extensions

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

        queries.forEach(query => {
            if (query.config.type === 'MUTATION') {
                resolvers.Mutation[query.config.path] = query.config.handler
            }

            if (query.config.type === 'QUERY') {
                resolvers.Query[query.config.path] = query.config.handler
            }
        })

        return resolvers
    }

    plugin() {
        return plugin('GraphQl')
            .afterDatabaseSetup(async config => {
                const {
                    resources,
                    graphQlExtensions,
                    graphQlMiddleware,
                    extendGraphQlQueries
                } = config
                const exposedResources = resources.filter(
                    resource => !resource.data.hideFromApi
                )

                this.pluginExtensions = this.pluginExtensions.concat(
                    graphQlExtensions
                )

                this.setupResourceGraphqlTypes(exposedResources, config)

                extendGraphQlQueries(this.getResolvers(exposedResources))

                graphQlMiddleware.unshift(graphQlQueries => {
                    const middlewareHandlers: Resolvers = {
                        Query: {},
                        Mutation: {}
                    }

                    const mapArgsToBody: GraphQlMiddleware = async (
                        resolve,
                        parent,
                        args,
                        context,
                        info
                    ) => {
                        context.body = args

                        const result = await resolve(
                            parent,
                            args,
                            context,
                            info
                        )

                        return result
                    }

                    graphQlQueries.forEach(query => {
                        if (query.config.type === 'QUERY') {
                            ;(middlewareHandlers.Query as any)[
                                query.config.path
                            ] = mapArgsToBody
                        }

                        if (query.config.type === 'MUTATION') {
                            ;(middlewareHandlers.Mutation as any)[
                                query.config.path
                            ] = mapArgsToBody
                        }
                    })

                    return middlewareHandlers
                })

                graphQlMiddleware.unshift(() => {
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
                })

                graphQlMiddleware.unshift(() => {
                    return async (resolve, parent, args, context, info) => {
                        context.authenticationError = (message?: string) =>
                            new AuthenticationError(
                                message || 'Unauthenticated.'
                            )

                        context.forbiddenError = (message?: string) =>
                            new ForbiddenError(message || 'Forbidden.')

                        context.validationError = (message?: string) =>
                            new ValidationError(message || 'Validation failed.')

                        context.userInputError = (message?: string) =>
                            new UserInputError(message || 'Invalid user input.')

                        const result = await resolve(
                            parent,
                            args,
                            context,
                            info
                        )

                        return result
                    }
                })
            })
            .setup(async config => {
                const {
                    graphQlMiddleware,
                    graphQlTypeDefs,
                    graphQlQueries,
                    manager,
                    app
                } = config
                const typeDefs = [gql(this.schemaString), ...graphQlTypeDefs]

                const resolvers = this.getResolversFromGraphqlQueries(
                    graphQlQueries
                )

                const schema = makeExecutableSchema({
                    typeDefs,
                    resolvers
                })

                const graphQlServer = new ApolloServer({
                    schema: applyMiddleware(
                        schema,
                        ...graphQlMiddleware.map(middlewareGenerator =>
                            middlewareGenerator(
                                graphQlQueries,
                                typeDefs,
                                schema
                            )
                        )
                    ),
                    ...this.appolloConfig,
                    context: ctx => ({
                        ...ctx,
                        ...config,
                        manager: manager!.fork()
                    })
                })

                graphQlServer.applyMiddleware({
                    app,
                    ...this.getMiddlewareOptions
                })
            })
    }
}

export const graphql = () => new Graphql()
