import { Request, Response } from 'express'
import CircularJSON from 'circular-json'
import qs from 'qs'
import {
    FindOptions,
    FilterQuery,
    AnyEntity,
    EntityName
} from '@mikro-orm/core'
import AsyncHandler from 'express-async-handler'
import { responseEnhancer } from 'express-response-formatter'
import {
    plugin,
    route,
    ResourceContract,
    RouteContract,
    Utils,
    Field,
    FieldContract
} from '@tensei/common'

class Rest {
    private getApiPath = (path: string) => {
        return `/${this.path}/${path}`
    }

    private path: string = ''

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
                    : null,
            per_page: findOptions.limit ? findOptions.limit : null,
            page_count: Math.ceil(total / findOptions.limit!)
        }
    }

    private parseQueryToFindOptions(query: any, resource: ResourceContract) {
        let findOptions: FindOptions<any> = {}

        if (query.page && query.page !== '-1') {
            findOptions.limit =
                parseInt(query.per_page) || resource.data.perPageOptions[0]
            findOptions.offset =
                query.page >= 1 ? (query.page - 1) * findOptions.limit : 0
        }

        if (query.populateOptions) {
            const strigifiedQuery = qs.stringify(query.populateOptions, { encode: false })
            const parsedQuery = qs.parse(strigifiedQuery, {
                arrayLimit: 100,
                depth: 20
            })

            findOptions.populate = parsedQuery as any
        }

        if (query.fields) {
            findOptions.fields = query.fields.split(',')
        }

        if (query.filters) {
            findOptions.filters = query.filters
        }

        if (query.sort) {
            const sorters = query.sort
                .split(',')
                .map((sorter: string) => sorter.split(':')) as string[]

            sorters.forEach(([field, direction]) => {
                findOptions.orderBy = {
                    ...findOptions.orderBy,
                    [field]: direction as any
                }
            })
        }

        return findOptions
    }

    private parseQueryToWhereOptions(query: any) {
        let whereOptions: FilterQuery<any> = {}

        if (query.where) {
            const strigifiedQuery = qs.stringify(
                typeof query.where === 'string'
                    ? JSON.parse(query.where)
                    : query.where,
                { encode: false }
            )
            const parsedQuery = qs.parse(strigifiedQuery, {
                decoder(value) {
                    if (/^(\d+|\d*\.\d+)$/.test(value)) {
                        return parseFloat(value)
                    }

                    value = value.replace(/where/, '')

                    let keywords: any = {
                        true: true,
                        false: false,
                        null: null,
                        undefined: undefined
                    }
                    if (value in keywords) {
                        return keywords[value]
                    }

                    return value
                }
            })
            whereOptions = parsedQuery
        }

        return whereOptions
    }

    public transformToInfoObject(resources: any, data: any) {
        const res = data.reduce((acc: any, currVal: any) => {
            const fields = this.getModelFields(resources, currVal.relation)

            let args = {}
            if (currVal.limit) {
                args = {
                    ...args,
                    limit: currVal.limit
                }
            }

            if (currVal.offset) {
                args = {
                    ...args,
                    offset: currVal.offset
                }
            }

            acc = {
                ...acc,
                [currVal.relation]: {
                    name: currVal.relation,
                    alias: currVal.relation,
                    args: {
                        ...args
                    },
                    fieldsByTypeName: {
                        ...fields
                    }
                }
            }

            if (currVal.populate) {
                acc[currVal.relation] = {
                    ...acc[currVal.relation],
                    fieldsByTypeName: {
                        [currVal.relation]: {
                            ...this.transformToInfoObject(
                                resources,
                                currVal.populate
                            )
                        }
                    }
                }
            }
            return acc
        }, {})
        return res
    }

    public getModelFields(resources: ResourceContract[], modelName: any) {
        const fields = resources.find(resource => {
            return resource.data.slugPlural === modelName
        })?.data.fields

        const result = fields
            ?.filter(field => !field.relatedProperty.reference)
            ?.reduce((acc: any, currVal: any) => {
                acc = {
                    ...acc,
                    [currVal.databaseField]: {
                        name: currVal.databaseField,
                        alias: currVal.databaseField,
                        args: {},
                        fieldsByTypeName: {}
                    }
                }
                return acc
            }, {})
        return result
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
                    .handle(async ({ manager, body, resources, userInputError }, response) => {
                        const [passed, payload] = await Utils.validator(
                            resource,
                            manager,
                            resources
                        ).validate(body)



                        if (!passed) {
                            return userInputError('Validation failed.', {
                                errors: payload
                            })
                        }

                        const entity = manager.create(modelName, body)

                        await manager.persistAndFlush(entity)

                        return response.status(201).json(entity)
                    })
            )

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
                    .handle(async ({ manager, query, config }, response) => {
                        const findOptions = this.parseQueryToFindOptions(
                            query,
                            resource
                        )
                        const whereOptions = this.parseQueryToWhereOptions(
                            query
                        )

                        config.databaseConfig.type!

                        const populateValues = Object.values(
                            findOptions.populate as any
                        ).map(item => Object.values(item as any))[0]

                        const res = this.transformToInfoObject(
                            resources,
                            populateValues
                        )

                        const fields = this.getModelFields(resources, plural)

                        const infoObj = {
                            ...fields,
                            ...res
                        }

                        const [
                            entities,
                            total
                        ] = await manager.findAndCount(
                            modelName,
                            whereOptions,
                            { ...findOptions, populate: [] }
                        )

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            manager,
                            config.databaseConfig.type!,
                            resource,
                            infoObj,
                            entities
                        )

                        return response.formatter.ok(
                            JSON.parse(CircularJSON.stringify(entities)),
                            this.getPageMetaFromFindOptions(total, findOptions)
                        )
                    })
            )

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
                    .handle(async ({ manager, params, query, config }, response) => {
                        const findOptions = this.parseQueryToFindOptions(
                            query,
                            resource
                        )

                        let populateValues
                        let res = []

                        if (findOptions.populate) {
                            populateValues = Object.values(
                                findOptions.populate as any
                            ).map(item => Object.values(item as any))[0]

                            res = this.transformToInfoObject(
                                resources,
                                populateValues
                            )
                        }

                        const fields = this.getModelFields(resources, plural)

                        const infoObj = {
                            ...fields,
                            ...res
                        }

                        const entity = await manager.findOne(
                            modelName as EntityName<AnyEntity<any>>,
                            params.id as FilterQuery<AnyEntity<any>>,
                            { ...findOptions, populate: [] }
                        )

                        await Utils.graphql.populateFromResolvedNodes(
                            resources,
                            manager,
                            config.databaseConfig.type!,
                            resource,
                            infoObj,
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
                    })
            )

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
                    .handle(async ({ manager, params, query }, response) => {
                        const whereOptions = this.parseQueryToWhereOptions(
                            query
                        )
                        try {
                            const entity = await manager.findOneOrFail(
                                modelName as EntityName<AnyEntity<any>>,
                                params.id as FilterQuery<AnyEntity<any>>,
                                this.parseQueryToFindOptions(query, resource)
                            )

                            await manager.populate(
                                entity,
                                params['relatedResource'],
                                whereOptions
                            )

                            return response.formatter.ok(
                                entity?.[params['relatedResource']]
                            )
                        } catch (error) {
                            if (error?.name === 'ValidationError') {
                                return response.formatter.notFound(
                                    `The ${modelName} model does not have a '${params['relatedResource']}' property`
                                )
                            }
                            return response.formatter.badRequest({
                                message: 'The request was not understood.'
                            })
                        }
                    })
            )

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
                            { manager, params, body, query, resources, userInputError },
                            response
                        ) => {
                            const [passed, payload] = await Utils.validator(
                                resource,
                                manager,
                                resources
                            ).validate(body)

                            if (!passed) {
                                return userInputError('Validation failed.', {
                                    errors: payload
                                })
                            }

                            const entity = manager.findOne(
                                modelName as EntityName<AnyEntity<any>>,
                                params.id as FilterQuery<AnyEntity<any>>,
                                this.parseQueryToFindOptions(query, resource)
                            )

                            if (!entity) {
                                return response.formatter.notFound(
                                    `Could not find ${resource.data.snakeCaseName} with ID of ${params.id}`
                                )
                            }

                            manager.assign(entity, body)

                            await manager.persistAndFlush(entity)

                            return response.formatter.ok(entity)
                        }
                    )
            )

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
                    .handle(async ({ manager, params, query }, response) => {
                        const modelRepository = manager.getRepository(
                            modelName as EntityName<AnyEntity<any>>
                        )

                        const entity = await modelRepository.findOne(
                            params.id as FilterQuery<AnyEntity<any>>,
                            this.parseQueryToFindOptions(query, resource)
                        )

                        if (!entity) {
                            return response.formatter.notFound(
                                `Could not find ${resource.data.pascalCaseName} with ID of ${params.id}`
                            )
                        }

                        await modelRepository.removeAndFlush(entity)
                        return response.formatter.ok(entity)
                    })
            )
        })

        return routes
    }

    plugin() {
        return plugin('Rest API').boot(
            async ({
                app,
                resources,
                currentCtx,
                extendRoutes,
            }) => {
                app.use(responseEnhancer())

                extendRoutes(
                    this.extendRoutes(resources, (path: string) =>
                        this.getApiPath(path)
                    )
                )
                currentCtx().routes.forEach(route => {
                    ; (app as any)[route.config.type.toLowerCase()](
                        route.config.path,
                        ...route.config.middleware.map(fn => AsyncHandler(fn)),
                        AsyncHandler(
                            async (request: Request, response: Response) =>
                                route.config.handler(request, response)
                        )
                    )
                })
            }
        )
    }
}

export const rest = () => new Rest()
