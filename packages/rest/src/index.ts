import { Request, Response, NextFunction } from 'express'
import CircularJSON from 'circular-json'
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
    RouteContract,
    ResourceContract,
    ApiContext
} from '@tensei/common'

import {
    getGraphQlInfoObject,
    parseQueryToFindOptions,
    parseQueryToWhereOptions,
    getFindOptionsPopulate
} from './populate-helpers'

class Rest {
    private getApiPath = (path: string) => {
        return `/${this.path}/${path}`
    }

    private path: string = 'api'

    basePath(path: string) {
        this.path = path

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
                        .id(`insert_${singular}`)
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
                                )

                                await manager.persistAndFlush(entity)

                                await manager.populate(
                                    [entity],
                                    getFindOptionsPopulate(findOptions)
                                )

                                await Utils.graphql.populateFromResolvedNodes(
                                    resources,
                                    manager,
                                    config.databaseConfig.type!,
                                    resource,
                                    getGraphQlInfoObject(
                                        findOptions,
                                        resources,
                                        resource
                                    ),
                                    [entity]
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
                        .id(`fetch_${plural}`)
                        .resource(resource)
                        .path(getApiPath(plural))
                        .extend({
                            docs: {
                                summary: `Fetch multiple ${plural}`,
                                description: `This endpoint fetches all ${plural} that match an optional where query.`
                            }
                        })
                        .handle(
                            async ({ manager, query, config }, response) => {
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
                                    {
                                        ...findOptions,
                                        populate: getFindOptionsPopulate(
                                            findOptions
                                        )
                                    }
                                )

                                await Utils.graphql.populateFromResolvedNodes(
                                    resources,
                                    manager,
                                    config.databaseConfig.type!,
                                    resource,
                                    getGraphQlInfoObject(
                                        findOptions,
                                        resources,
                                        resource
                                    ),
                                    entities
                                )

                                return response.formatter.ok(
                                    JSON.parse(
                                        CircularJSON.stringify(entities)
                                    ),
                                    this.getPageMetaFromFindOptions(
                                        total,
                                        findOptions
                                    )
                                )
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnFetchApi &&
                routes.push(
                    route(`Fetch single ${singular}`)
                        .get()
                        .internal()
                        .id(`show_${singular}`)
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
                                    {
                                        ...findOptions,
                                        populate: getFindOptionsPopulate(
                                            findOptions
                                        )
                                    }
                                )

                                await Utils.graphql.populateFromResolvedNodes(
                                    resources,
                                    manager,
                                    config.databaseConfig.type!,
                                    resource,
                                    getGraphQlInfoObject(
                                        findOptions,
                                        resources,
                                        resource
                                    ),
                                    [entity]
                                )

                                if (!entity) {
                                    return response.formatter.notFound(
                                        `could not find ${modelName} with ID ${params.id}`
                                    )
                                }
                                return response.formatter.ok(
                                    JSON.parse(CircularJSON.stringify(entity))
                                )
                            }
                        )
                )

            !resource.isHiddenOnApi() &&
                !resource.data.hideOnFetchApi &&
                routes.push(
                    route(`Fetch ${singular} relations`)
                        .get()
                        .id(`fetch_${singular}_relations`)
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
                                        {
                                            ...findOptions,
                                            populate: getFindOptionsPopulate(
                                                findOptions
                                            )
                                        }
                                    )

                                    await Utils.graphql.populateFromResolvedNodes(
                                        resources,
                                        manager,
                                        config.databaseConfig.type!,
                                        resource,
                                        getGraphQlInfoObject(
                                            findOptions,
                                            resources,
                                            resource
                                        ),
                                        results
                                    )

                                    return response.formatter.ok(
                                        JSON.parse(
                                            CircularJSON.stringify(results)
                                        ),
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
                                        {
                                            ...findOptions,
                                            populate: getFindOptionsPopulate(
                                                findOptions
                                            )
                                        }
                                    )

                                    await Utils.graphql.populateFromResolvedNodes(
                                        resources,
                                        manager,
                                        config.databaseConfig.type!,
                                        resource,
                                        getGraphQlInfoObject(
                                            findOptions,
                                            resources,
                                            resource
                                        ),
                                        results
                                    )

                                    return response.formatter.ok(
                                        JSON.parse(
                                            CircularJSON.stringify(results)
                                        ),
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

                                    manager.clear()

                                    const result = await manager.findOne(
                                        relatedResource.data.pascalCaseName,
                                        {
                                            id: payload.id
                                        },
                                        {
                                            ...findOptions,
                                            populate: getFindOptionsPopulate(
                                                findOptions
                                            )
                                        }
                                    )

                                    await Utils.graphql.populateFromResolvedNodes(
                                        resources,
                                        manager,
                                        config.databaseConfig.type!,
                                        resource,
                                        getGraphQlInfoObject(
                                            findOptions,
                                            resources,
                                            resource
                                        ),
                                        [result]
                                    )

                                    return response.formatter.ok(
                                        JSON.parse(
                                            CircularJSON.stringify(result)
                                        )
                                    )
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
                        .id(`update_${singular}`)
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
                                    {
                                        ...findOptions,
                                        populate: getFindOptionsPopulate(
                                            findOptions
                                        )
                                    }
                                )

                                if (!entity) {
                                    return response.formatter.notFound(
                                        `Could not find ${resource.data.snakeCaseName} with ID of ${params.id}`
                                    )
                                }

                                manager.assign(entity, body)

                                await manager.persistAndFlush(entity)

                                await Utils.graphql.populateFromResolvedNodes(
                                    resources,
                                    manager,
                                    config.databaseConfig.type!,
                                    resource,
                                    getGraphQlInfoObject(
                                        findOptions,
                                        resources,
                                        resource
                                    ),
                                    [entity]
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
                        .id(`delete_${singular}`)
                        .resource(resource)
                        .path(getApiPath(`${plural}/:id`))
                        .extend({
                            docs: {
                                summary: `Delete a single ${singular}`,
                                description: `This endpoint deletes a single ${singular}. Provide the primary key ID of the entity you want to delete.`
                            }
                        })
                        .handle(
                            async ({ manager, params, query }, response) => {
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
                                return response.formatter.ok(entity)
                            }
                        )
                )
        })

        return routes
    }

    private authorizeResolver = async (
        ctx: ApiContext,
        query: RouteContract
    ) => {
        const authorized = await Promise.all(
            query.config.authorize.map(fn => fn(ctx))
        )

        if (
            authorized.filter(result => result).length !==
            query.config.authorize.length
        ) {
            throw ctx.forbiddenError('Unauthorized.')
        }
    }

    plugin() {
        return plugin('Rest API')
            .register(({ app, resources, extendRoutes }) => {
                app.use(responseEnhancer())

                extendRoutes(
                    this.extendRoutes(resources, (path: string) =>
                        this.getApiPath(path)
                    )
                )
            })
            .boot(async ({ app, currentCtx }) => {
                currentCtx().routes.forEach(route => {
                    const path = route.config.path.startsWith('/')
                        ? route.config.path
                        : `/${route.config.path}`

                    ;(app as any)[route.config.type.toLowerCase()](
                        path,

                        ...route.config.middleware.map(fn => AsyncHandler(fn)),
                        AsyncHandler(
                            async (
                                request: Request,
                                response: Response,
                                next: NextFunction
                            ) => {
                                await this.authorizeResolver(
                                    request as any,
                                    route
                                )

                                return next()
                            }
                        ),
                        AsyncHandler(
                            async (request: Request, response: Response) =>
                                route.config.handler(request, response)
                        )
                    )
                })
            })
    }
}

export const rest = () => new Rest()
