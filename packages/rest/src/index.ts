import Fs from 'fs'
import Path from 'path'
import {
    FindOptions,
    FilterQuery,
    AnyEntity,
    EntityName,
    ReferenceType
} from '@mikro-orm/core'
import Mustache from 'mustache'
import AsyncHandler from 'express-async-handler'
import { responseEnhancer } from 'express-response-formatter'
import {
    route,
    Utils,
    event,
    plugin,
    ApiContext,
    RouteContract,
    ResourceContract,
    RouteParameter
} from '@tensei/common'

import {
    parseQueryToFindOptions,
    parseQueryToWhereOptions
} from './populate-helpers'
import { DataPayload } from '@tensei/common'

const indexFileContent = Fs.readFileSync(
    Path.resolve(__dirname, 'docs', 'index.mustache')
).toString()

class Rest {
    private getApiPath = (path: string) => {
        return `/${this.path}/${path}`
    }

    private path: string = 'api'

    private routePrefix: string = ''

    basePath(path: string) {
        this.path = path

        return this
    }

    prefix(prefix: string) {
        this.routePrefix = prefix

        return this
    }

    private getPageMetaFromFindOptions(
        total: number,
        findOptions: FindOptions<any>
    ) {
        return {
            total,
            page:
                findOptions.offset ||
                (findOptions.offset === 0 && findOptions.limit)
                    ? Math.ceil((findOptions.offset + 1) / findOptions.limit!)
                    : 0,
            per_page: findOptions.limit ? findOptions.limit : 0,
            page_count: Math.ceil(total / findOptions.limit!) || 0
        }
    }

    private getRouteId(id: string) {
        return this.routePrefix ? `${this.routePrefix}_${id}` : id
    }

    private extendRoutes(
        resources: ResourceContract[],
        getApiPath: (path: string) => string
    ) {
        const routes: RouteContract[] = []

        const paginationParameters = (
            resource: ResourceContract
        ): RouteParameter[] => {
            return [
                {
                    in: 'query',
                    name: 'page',
                    type: 'number',
                    validation: ['required'],
                    description: `The page to be fetched.`
                },
                {
                    in: 'query',
                    name: 'per_page',
                    type: 'number',
                    validation: ['required'],
                    description: `The page to be fetched.`
                },
                {
                    in: 'query',
                    name: 'fields',
                    type: 'string',
                    validation: [
                        `in:${resource.data.fields
                            .filter(
                                field =>
                                    !field.showHideFieldFromApi.hideOnFetchApi
                            )
                            .map(field => field.databaseField)
                            .join(',')}`
                    ],
                    description: `The list of fields to be selected from the database (separated by commas).`
                },
                {
                    in: 'query',
                    name: 'populate',
                    type: 'string',
                    validation: [
                        `in:${resource.data.fields
                            .filter(field => field.isRelationshipField)
                            .map(field => field.databaseField)
                            .join(',')}`
                    ],
                    description: `Populate related resources (separated by commas). Populate nested resources by using the dot(.) notation.`
                },
                {
                    in: 'query',
                    name: 'sort',
                    type: 'string',
                    description: `Sort the results based on one of the available fields of this resource.`
                },
                {
                    in: 'query',
                    name: 'where',
                    type: 'string',
                    description: `Filter results based on a where query.`
                }
            ]
        }

        resources.forEach(resource => {
            const {
                slugSingular: singular,
                slugPlural: plural,
                pascalCaseName: modelName
            } = resource.data

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnInsertApi &&
                routes.push(
                    route(`Insert ${singular}`)
                        .post()
                        .internal()
                        .group(resource.data.label)
                        .parameters(
                            resource.data.fields
                                .filter(
                                    field =>
                                        !field.showHideFieldFromApi
                                            .hideOnInsertApi &&
                                        ![
                                            'id',
                                            '_id',
                                            'created_at',
                                            'updated_at'
                                        ].includes(field.databaseField)
                                )
                                .map(field => ({
                                    in: 'body',
                                    name: field.databaseField,
                                    description: field.helpText,
                                    validation: field.creationValidationRules.concat(
                                        field.validationRules
                                    ),
                                    type:
                                        field.relatedProperty.type ||
                                        field.property.type!
                                }))
                        )
                        .id(this.getRouteId(`insert_${singular}`))
                        .resource(resource)
                        .path(getApiPath(plural))
                        .description(`Insert a single ${singular}.`)
                        .handle(
                            async (
                                {
                                    manager,
                                    body,
                                    resources: resourcesMap,
                                    userInputError,
                                    config,
                                    query
                                },
                                response
                            ) => {
                                const findOptions = parseQueryToFindOptions(
                                    query,
                                    resource
                                )

                                const [passed, payload] = await Utils.validator(
                                    resource,
                                    manager,
                                    resourcesMap
                                ).validate(body)

                                if (!passed) {
                                    throw userInputError('Validation failed.', {
                                        errors: payload
                                    })
                                }

                                const entity = manager.create(
                                    resource.data.pascalCaseName,
                                    body
                                ) as any

                                await manager.persistAndFlush(entity)

                                await manager.populate(
                                    [entity],
                                    findOptions.populate || []
                                )

                                config.emitter.emit(
                                    `${singular}::inserted`,
                                    entity
                                )

                                return response.formatter.created(entity)
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnFetchApi &&
                routes.push(
                    route(`Fetch multiple ${plural}`)
                        .get()
                        .internal()
                        .group(resource.data.label)
                        .id(plural)
                        .parameters(paginationParameters(resource))
                        .resource(resource)
                        .path(getApiPath(plural))
                        .description(
                            `This endpoint fetches all ${plural} that match an optional where query.`
                        )
                        .handle(async ({ manager, query }, response) => {
                            const findOptions = parseQueryToFindOptions(
                                query,
                                resource
                            )

                            const [
                                entities,
                                total
                            ] = await manager.findAndCount(
                                modelName,
                                parseQueryToWhereOptions(query),
                                findOptions
                            )

                            return response.formatter.ok(
                                entities,
                                this.getPageMetaFromFindOptions(
                                    total,
                                    findOptions
                                )
                            )
                        })
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnFetchApi &&
                routes.push(
                    route(`Fetch single ${singular}`)
                        .get()
                        .parameters([
                            {
                                in: 'path',
                                name: 'id',
                                type: 'number',
                                validation: ['required'],
                                description: `The ID of the ${singular} to fetch.`
                            }
                        ])
                        .group(resource.data.label)
                        .internal()
                        .id(singular)
                        .resource(resource)
                        .description(
                            `This endpoint fetches a single ${singular}. Provide the primary key ID of the entity you want to fetch.`
                        )
                        .path(getApiPath(`${plural}/:id`))
                        .handle(
                            async (
                                { manager, params, query, config },
                                response
                            ) => {
                                const findOptions = parseQueryToFindOptions(
                                    query,
                                    resource
                                )

                                const entity = await manager.findOne(
                                    modelName as EntityName<AnyEntity<any>>,
                                    params.id as FilterQuery<AnyEntity<any>>,
                                    findOptions
                                )

                                if (!entity) {
                                    return response.formatter.notFound(
                                        `could not find ${modelName} with ID ${params.id}`
                                    )
                                }
                                return response.formatter.ok(entity)
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnFetchApi &&
                routes.push(
                    route(`Fetch ${singular} relations`)
                        .get()
                        .parameters([
                            {
                                in: 'path',
                                name: 'id',
                                type: 'number',
                                validation: ['required'],
                                description: `The ID of the ${singular} to fetch relations of.`
                            },
                            {
                                in: 'path',
                                name: 'relatedResource',
                                type: 'string',
                                validation: [
                                    'required',
                                    `in:${resource.data.fields
                                        .filter(
                                            field => field.isRelationshipField
                                        )
                                        .map(field => field.databaseField)
                                        .join(',')}`
                                ],
                                description: `The slug path of the related resource you want to fetch.`
                            },
                            ...paginationParameters(resource)
                        ])
                        .group(resource.data.label)
                        .id(`index_${singular}_relations`)
                        .internal()
                        .resource(resource)
                        .description(
                            `This endpoint figures out the relationship passed as /:relatedResource (one-to-one, one-to-many, many-to-many, or many-to-one) and returns all related entities. The result will be a paginated array for many-to-* relations and an object for one-to-* relations.`
                        )
                        .path(getApiPath(`${plural}/:id/:relatedResource`))
                        .handle(
                            async (
                                {
                                    manager,
                                    params,
                                    query,
                                    userInputError,
                                    config
                                },
                                response
                            ) => {
                                const whereOptions = parseQueryToWhereOptions(
                                    query
                                )
                                const findOptions = parseQueryToFindOptions(
                                    query,
                                    resource
                                )

                                const relatedField = resource.data.fields.find(
                                    f =>
                                        f.databaseField ===
                                        params.relatedResource
                                )

                                if (!relatedField) {
                                    throw userInputError(
                                        `Invalid related resource ${params.relatedResource}`
                                    )
                                }

                                const relatedResource = resources.find(
                                    resource =>
                                        resource.data.pascalCaseName ===
                                        relatedField.relatedProperty.type
                                )!

                                if (
                                    relatedField.relatedProperty.reference ===
                                    ReferenceType.ONE_TO_MANY
                                ) {
                                    const relatedManyToOne = relatedResource.data.fields.find(
                                        f =>
                                            f.relatedProperty.type ===
                                                resource.data.pascalCaseName &&
                                            f.relatedProperty.reference ===
                                                ReferenceType.MANY_TO_ONE
                                    )!

                                    const [
                                        results,
                                        count
                                    ] = await manager.findAndCount(
                                        relatedResource.data.pascalCaseName,
                                        {
                                            [relatedManyToOne.databaseField]:
                                                params.id,
                                            ...whereOptions
                                        },
                                        findOptions
                                    )

                                    return response.formatter.ok(
                                        results,
                                        this.getPageMetaFromFindOptions(
                                            count,
                                            findOptions
                                        )
                                    )
                                }

                                if (
                                    relatedField.relatedProperty.reference ===
                                    ReferenceType.MANY_TO_MANY
                                ) {
                                    const relatedManyToMany = relatedResource.data.fields.find(
                                        f =>
                                            f.relatedProperty.type ===
                                                resource.data.pascalCaseName &&
                                            f.relatedProperty.reference ===
                                                ReferenceType.MANY_TO_MANY
                                    )!

                                    const [
                                        results,
                                        count
                                    ] = await manager.findAndCount(
                                        relatedResource.data.pascalCaseName,
                                        {
                                            [relatedManyToMany.databaseField]: {
                                                $in: [params.id]
                                            },
                                            ...whereOptions
                                        },
                                        findOptions
                                    )

                                    return response.formatter.ok(
                                        results,
                                        this.getPageMetaFromFindOptions(
                                            count,
                                            findOptions
                                        )
                                    )
                                }

                                if (
                                    relatedField.relatedProperty.reference ===
                                        ReferenceType.MANY_TO_ONE ||
                                    relatedField.relatedProperty.reference ===
                                        ReferenceType.ONE_TO_ONE
                                ) {
                                    const payload = ((await manager.findOneOrFail(
                                        resource.data.pascalCaseName,
                                        {
                                            id: params.id
                                        },
                                        {
                                            populate: [
                                                relatedField.databaseField
                                            ]
                                        }
                                    )) as any)[relatedField.databaseField]

                                    if (!payload) {
                                        return response.formatter.ok(null)
                                    }

                                    manager.clear()

                                    const result = await manager.findOne(
                                        relatedResource.data.pascalCaseName,
                                        {
                                            id: payload.id
                                        },
                                        findOptions
                                    )

                                    return response.formatter.ok(result)
                                }
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnUpdateApi &&
                routes.push(
                    route(`Update single ${singular}`)
                        .patch()
                        .internal()
                        .parameters(
                            resource.data.fields
                                .filter(
                                    field =>
                                        !field.showHideFieldFromApi
                                            .hideOnUpdateApi &&
                                        ![
                                            'id',
                                            '_id',
                                            'created_at',
                                            'updated_at'
                                        ].includes(field.databaseField)
                                )
                                .map(field => ({
                                    in: 'body',
                                    name: field.databaseField,
                                    description: field.helpText,
                                    validation: field.creationValidationRules.concat(
                                        field.validationRules
                                    ),
                                    type:
                                        field.relatedProperty.type ||
                                        field.property.type!
                                }))
                        )
                        .group(resource.data.label)
                        .id(this.getRouteId(`update_${singular}`))
                        .resource(resource)
                        .description(
                            `This endpoint update a single ${singular}. Provide the primary key ID of the ${singular} you want to update.`
                        )
                        .path(getApiPath(`${plural}/:id`))
                        .handle(
                            async (
                                {
                                    manager,
                                    params,
                                    body,
                                    query,
                                    resources: resourcesMap,
                                    userInputError,
                                    config
                                },
                                response
                            ) => {
                                const [passed, payload] = await Utils.validator(
                                    resource,
                                    manager,
                                    resourcesMap,
                                    params.id
                                ).validate(body, false)

                                if (!passed) {
                                    throw userInputError('Validation failed.', {
                                        errors: payload
                                    })
                                }

                                const findOptions = parseQueryToFindOptions(
                                    query,
                                    resource
                                )

                                const entity = await manager.findOne(
                                    resource.data.pascalCaseName,
                                    params.id,
                                    findOptions
                                )

                                if (!entity) {
                                    return response.formatter.notFound(
                                        `Could not find ${resource.data.snakeCaseName} with ID of ${params.id}`
                                    )
                                }

                                manager.assign(entity, body)

                                await manager.persistAndFlush(entity)

                                config.emitter.emit(
                                    `${singular}::updated`,
                                    entity
                                )

                                return response.formatter.ok(entity)
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnDeleteApi &&
                routes.push(
                    route(`Delete single ${singular}`)
                        .delete()
                        .internal()
                        .parameters([
                            {
                                in: 'path',
                                name: 'id',
                                type: 'number',
                                validation: ['required'],
                                description: `The ID of the ${singular} to delete.`
                            }
                        ])
                        .group(resource.data.label)
                        .id(this.getRouteId(`delete_${singular}`))
                        .resource(resource)
                        .path(getApiPath(`${plural}/:id`))
                        .extend({
                            docs: {
                                summary: `Delete a single ${singular}`,
                                description: `This endpoint deletes a single ${singular}. Provide the primary key ID of the entity you want to delete.`
                            }
                        })
                        .handle(
                            async (
                                { manager, params, query, config },
                                response
                            ) => {
                                const modelRepository = manager.getRepository(
                                    modelName as EntityName<AnyEntity<any>>
                                )

                                const entity = await modelRepository.findOne(
                                    params.id as FilterQuery<AnyEntity<any>>,
                                    parseQueryToFindOptions(query, resource)
                                )

                                if (!entity) {
                                    return response.formatter.notFound(
                                        `Could not find ${resource.data.pascalCaseName} with ID of ${params.id}`
                                    )
                                }

                                await modelRepository.removeAndFlush(entity)

                                config.emitter.emit(`${singular}::deleted`, [
                                    entity
                                ])

                                return response.formatter.ok(entity)
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnDeleteApi &&
                routes.push(
                    route(`Delete many ${plural}`)
                        .delete()
                        .group(resource.data.label)
                        .internal()
                        .id(this.getRouteId(`delete_many_${singular}`))
                        .resource(resource)
                        .path(getApiPath(`${plural}`))
                        .description(
                            `This endpoint deletes multiple ${plural}. Provide a search query to find all ${plural} to be deleted.`
                        )
                        .handle(
                            async ({ manager, query, config }, response) => {
                                const entities = await manager.find(
                                    modelName,
                                    parseQueryToWhereOptions(query)
                                )

                                await manager.removeAndFlush(entities)

                                config.emitter.emit(
                                    `${singular}::deleted`,
                                    entities
                                )

                                return response.formatter.ok(entities)
                            }
                        )
                )
        })

        return routes
    }

    plugin() {
        return plugin('Rest API')
            .register(({ app, resources, extendRoutes }) => {
                app.use(responseEnhancer())

                app.get('/rest-docs.css', (request, response) =>
                    response.sendFile(
                        Path.resolve(__dirname, 'docs', 'app.css')
                    )
                )
                app.get('/rest-docs.js', (request, response) =>
                    response.sendFile(Path.resolve(__dirname, 'docs', 'app.js'))
                )

                extendRoutes(
                    this.extendRoutes(resources, (path: string) =>
                        this.getApiPath(path)
                    ).map(route =>
                        route.middleware([
                            (request, response, next) => {
                                // register filters
                                resources.forEach(resource => {
                                    resource.data.filters.forEach(filter => {
                                        request.manager.addFilter(
                                            filter.config.shortName,
                                            (args: DataPayload, type: 'read' | 'update' | 'delete') => filter.config.cond(args, request, type),
                                            resource.data.pascalCaseName,
                                            filter.config.default
                                        )
                                    })
                                })

                                // set filter parameters
                                resources.forEach(resource => {
                                    resource.data.filters.forEach(filter => {
                                        const filterFromBody = (request.query as any)?.filters?.find(
                                            (bodyFitler: any) =>
                                                bodyFitler.name ===
                                                filter.config.shortName
                                        )

                                        request.manager.setFilterParams(
                                            filter.config.shortName,
                                            filterFromBody?.args || {}
                                        )
                                    })
                                })

                                next()
                            }
                        ])
                    )
                )
            })
            .boot(({ app, name, routes, extendEvents, serverUrl }) => {
                app.get('/rest/routes', (request, response) =>
                    response.json(
                        routes.map(route => ({
                            ...route.serialize(),
                            path: `/${route.config.path}`
                        }))
                    )
                )

                app.get('/rest-docs(/*)?', (request, response) =>
                    response.send(
                        Mustache.render(indexFileContent, {
                            name
                        })
                    )
                )

                extendEvents([
                    event('tensei::listening').listen(({ ctx }) => {
                        ctx.logger.info(
                            `🧘🏽 Access your rest api documentation on ${serverUrl}/rest-docs`
                        )
                    })
                ])
            })
    }
}

export const rest = () => new Rest()
