import * as formatter from 'express-response-formatter'
import { FindOptions, ReferenceType } from '@mikro-orm/core'
import { route, RouteContract, Utils, Config } from '@tensei/common'

const getPageMetaFromFindOptions = (
    total: number,
    findOptions: FindOptions<any>
) => {
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

export default (config: Config, cmsConfig: any) => {
    const routes: RouteContract[] = []

    const getRouteId = (path: string) => {
        return `cms_${path}`
    }

    const getApiPath = (path: string) => {
        return `${cmsConfig.apiPath}/${path}`
    }

    const { resources } = config

    resources.forEach(resource => {
        const {
            slugSingular: singular,
            slugPlural: plural,
            pascalCaseName: modelName
        } = resource.data

        routes.push(
            route(`CMS: Insert ${singular}`)
                .post()
                .internal()
                .id(getRouteId(`insert_${singular}`))
                .resource(resource)
                .path(getApiPath(plural))
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
                        const findOptions = Utils.rest.parseQueryToFindOptions(
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

                        config.emitter.emit(`${singular}::inserted`, entity)

                        return response.formatter.created(entity)
                    }
                )
        )

        routes.push(
            route(`CMS: Fetch multiple ${plural}`)
                .get()
                .internal()
                .id(getRouteId(`fetch_${plural}`))
                .resource(resource)
                .path(getApiPath(plural))
                .extend({
                    docs: {
                        summary: `Fetch multiple ${plural}`,
                        description: `This endpoint fetches all ${plural} that match an optional where query.`
                    }
                })
                .handle(async ({ manager, query }, response) => {
                    const findOptions = Utils.rest.parseQueryToFindOptions(
                        query,
                        resource
                    )

                    const [entities, total] = await manager.findAndCount(
                        modelName,
                        Utils.rest.parseQueryToWhereOptions(query),
                        findOptions
                    )

                    return response.formatter.ok(
                        entities,
                        getPageMetaFromFindOptions(total, findOptions)
                    )
                })
        )

        !resource.isHiddenOnApi() &&
            !resource.data.hideOnFetchApi &&
            routes.push(
                route(`Fetch single ${singular}`)
                    .get()
                    .internal()
                    .id(getRouteId(`show_${singular}`))
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
                            const findOptions = Utils.rest.parseQueryToFindOptions(
                                query,
                                resource
                            )

                            const entity = await manager.findOne(
                                modelName,
                                params.id,
                                findOptions
                            )

                            if (!entity) {
                                return response.formatter.notFound(
                                    `Could not find ${modelName} with ID ${params.id}`
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
                    .id(getRouteId(`fetch_${singular}_relations`))
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
                            { manager, params, query, userInputError, config },
                            response
                        ) => {
                            const whereOptions = Utils.rest.parseQueryToWhereOptions(
                                query
                            )
                            const findOptions = Utils.rest.parseQueryToFindOptions(
                                query,
                                resource
                            )

                            const relatedField = resource.data.fields.find(
                                f => f.databaseField === params.relatedResource
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
                                    getPageMetaFromFindOptions(
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
                                    getPageMetaFromFindOptions(
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
                                        populate: [relatedField.databaseField]
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
                    .id(getRouteId(`update_${singular}`))
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

                            const findOptions = Utils.rest.parseQueryToFindOptions(
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

                            config.emitter.emit(`${singular}::updated`, entity)

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
                    .id(getRouteId(`delete_${singular}`))
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
                                modelName
                            )

                            const entity = await modelRepository.findOne(
                                params.id,
                                Utils.rest.parseQueryToFindOptions(
                                    query,
                                    resource
                                ) as any
                            )

                            if (!entity) {
                                return response.formatter.notFound(
                                    `Could not find ${resource.data.pascalCaseName} with ID of ${params.id}`
                                )
                            }

                            await modelRepository.removeAndFlush(entity)

                            config.emitter.emit(`${singular}::deleted`, entity)

                            return response.formatter.ok(entity)
                        }
                    )
            )
    })

    return routes
}
