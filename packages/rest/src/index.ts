import { Request, Response, NextFunction } from 'express'
import {
    FindOptions,
    FilterQuery,
    AnyEntity,
    EntityName,
    ReferenceType
} from '@mikro-orm/core'
import AsyncHandler from 'express-async-handler'
import { responseEnhancer } from 'express-response-formatter'
import {
    route,
    Utils,
    plugin,
    ApiContext,
    RouteContract,
    ResourceContract
} from '@tensei/common'

import {
    parseQueryToFindOptions,
    parseQueryToWhereOptions
} from './populate-helpers'

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
                        .id(this.getRouteId(`insert_${singular}`))
                        .resource(resource)
                        .path(getApiPath(plural))
                        .extend({
                            docs: {
                                summary: `Insert a single ${singular}.`
                            }
                        })
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
                        .id(plural)
                        .resource(resource)
                        .path(getApiPath(plural))
                        .extend({
                            docs: {
                                summary: `Fetch multiple ${plural}`,
                                description: `This endpoint fetches all ${plural} that match an optional where query.`
                            }
                        })
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
                        .internal()
                        .id(singular)
                        .resource(resource)
                        .extend({
                            docs: {
                                summary: `Fetch a single ${singular}`,
                                description: `This endpoint fetches a single ${singular}. Provide the primary key ID of the entity you want to fetch.`
                            }
                        })
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
                        .id(`index_${singular}_relations`)
                        .internal()
                        .resource(resource)
                        .extend({
                            docs: {
                                summary: `Fetch relation to a ${singular}`,
                                description: `This endpoint figures out the relationship passed as /:relatedResource (one-to-one, one-to-many, many-to-many, or many-to-one) and returns all related entities. The result will be a paginated array for many-to-* relations and an object for one-to-* relations.`
                            }
                        })
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
                        .id(this.getRouteId(`update_${singular}`))
                        .resource(resource)
                        .extend({
                            docs: {
                                summary: `Update a single ${singular}`,
                                description: `This endpoint update a single ${singular}. Provide the primary key ID of the entity you want to delete.`
                            }
                        })
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
                        .internal()
                        .id(this.getRouteId(`delete_many_${singular}`))
                        .resource(resource)
                        .path(getApiPath(`${plural}`))
                        .extend({
                            docs: {
                                summary: `Delete multiple ${plural}`,
                                description: `This endpoint deletes multiple ${plural}. Provide a search query to find all ${plural} to be deleted.`
                            }
                        })
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
        return plugin('Rest API').register(
            ({ app, resources, extendRoutes }) => {
                app.use(responseEnhancer())

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
                                            filter.config.cond,
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
            }
        )
    }
}

export const rest = () => new Rest()
