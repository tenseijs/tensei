import { Request, Response } from 'express'
import Pluralize from 'pluralize'
import qs from 'qs'
import {
    FindOptions,
    FilterQuery,
    AnyEntity,
    EntityName
} from '@mikro-orm/core'
import AsyncHandler from 'express-async-handler'
import { responseEnhancer } from 'express-response-formatter'
import { plugin, route, ResourceContract, RouteContract } from '@tensei/common'

class Rest {
    private getApiPath = (apiPath: string, path: string) => {
        return `/${apiPath}/${path}`
    }

    public getPageMetaFromFindOptions(
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

    public parseQueryToFindOptions(query: any, resource: ResourceContract) {
        let findOptions: FindOptions<any> = {}

        if (query.page && query.page !== '-1') {
            findOptions.limit =
                parseInt(query.per_page) || resource.data.perPageOptions[0]
            findOptions.offset =
                query.page >= 1 ? (query.page - 1) * findOptions.limit : 0
        }

        if (query.popu) {
            const strigifiedQuery = qs.stringify(query.popu, { encode: false })
            const parsedQuery = qs.parse(strigifiedQuery, {
                arrayLimit: 100,
                depth: 20
            })

            console.log(JSON.stringify(parsedQuery, null, 3), '--->>parsedQuery')

            findOptions.populate = parsedQuery
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

    public transformToInfoObject(resources: any, data: any) {
        const res = data.reduce((acc: any, currVal: any) => {
            const fields = this.getModelFields(resources, Pluralize(currVal.relation))
            acc = {
                ...acc,
                [currVal.relation]: {
                    ...fields
                }
            }
            if (currVal.populate) {
                acc[currVal.relation] = {
                    ...acc[currVal.relation],
                    ...this.transformToInfoObject(resources, currVal.populate)
                }
            }
            return acc
        }, {});
        return res
    }

    public getModelFields(resources: any, modelName: any) {
        const fields = resources[modelName].data.fields.reduce((acc: any, currVal: any) => {
            acc = {
                ...acc,
                [currVal.databaseField]: {
                    name: currVal.databaseField,
                    alias: currVal.databaseField,
                    args: {},
                    fieldsByTypeName: {}
                }
            }
            return acc;
        }, {})
        return fields;
    }

    public parseQueryToWhereOptions(query: any) {
        let whereOptions: FilterQuery<any> = {}

        if (query.where) {
            const strigifiedQuery = qs.stringify(query.where, { encode: false })
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

    extendRoutes(
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
                    .resource(resource)
                    .path(getApiPath(plural))
                    .handle(async ({ manager, body }, response) => {
                        const entity = manager.create(modelName, body)

                        await manager.persistAndFlush(entity)

                        return response.status(201).json(entity)
                    })
            )

            routes.push(
                route(`Insert multiple ${plural}`)
                    .post()
                    .resource(resource)
                    .path(getApiPath(plural))
                    .handle(async ({ manager, body }, response) => {
                        const entities = (
                            body.objects || []
                        ).map((object: any) =>
                            manager.create(modelName, object)
                        )

                        await manager.persistAndFlush(entities)

                        return response.formatter.created(entities)
                    })
            )

            routes.push(
                route(`Fetch multiple ${plural}`)
                    .get()
                    .resource(resource)
                    .path(getApiPath(plural))
                    .handle(async ({ manager, query, resources }, response) => {
                        const findOptions = this.parseQueryToFindOptions(
                            query,
                            resource
                        )
                        const whereOptions = this.parseQueryToWhereOptions(
                            query
                        )

                        const populateValues = Object.values(findOptions.populate as any).map(item => Object.values(item as any))[0]
                        const res = this.transformToInfoObject(resources, populateValues)

                        console.log(JSON.stringify(res, null, 2), '====>>>Ress')

                        const [entities, total] = await manager.findAndCount(
                            modelName,
                            whereOptions,
                            findOptions
                        )

                        return response.formatter.ok(
                            entities,
                            this.getPageMetaFromFindOptions(total, findOptions)
                        )
                    })
            )

            routes.push(
                route(`Fetch single ${singular}`)
                    .get()
                    .resource(resource)
                    .path(getApiPath(`${plural}/:id`))
                    .handle(async ({ manager, params, query }, response) => {
                        const findOptions = this.parseQueryToFindOptions(
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
                    })
            )

            routes.push(
                route(`Fetch ${singular} relations`)
                    .get()
                    .resource(resource)
                    .path(getApiPath(`${plural}/:id/:relatedResource`))
                    .handle(async ({ manager, params, query }, response) => {
                        const whereOptions = this.parseQueryToWhereOptions(
                            query
                        )
                        try {
                            const entity = await manager.findOne(
                                modelName as EntityName<AnyEntity<any>>,
                                params.id as FilterQuery<AnyEntity<any>>
                            )

                            await manager.populate(
                                entity,
                                params.relatedResource,
                                whereOptions
                            )
                            return response.formatter.ok(
                                entity?.[params.relatedResource]
                            )
                        } catch (error) {
                            if (error?.name === 'ValidationError') {
                                return response.formatter.notFound(
                                    `The ${modelName} model does not have a '${params.relatedResource}' property`
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
                    .put()
                    .resource(resource)
                    .path(getApiPath(`${plural}/:id`))
                    .handle(async ({ manager, params, body }, response) => {
                        const entity = manager.findOne(
                            modelName as EntityName<AnyEntity<any>>,
                            params.id as FilterQuery<AnyEntity<any>>
                        )

                        if (!entity) {
                            return response.formatter.notFound(
                                `Could not find resourceName with ID of ${params.id}`
                            )
                        }

                        manager.assign(entity, body)

                        await manager.persistAndFlush(entity)

                        return response.formatter.ok(entity)
                    })
            )

            routes.push(
                route(`Delete single ${singular}`)
                    .delete()
                    .resource(resource)
                    .path(getApiPath(`${plural}/:id`))
                    .handle(async ({ manager, params, body }, response) => {
                        const modelRepository = manager.getRepository(
                            modelName as EntityName<AnyEntity<any>>
                        )
                        const entity = modelRepository.findOne(
                            params.id as FilterQuery<AnyEntity<any>>
                        )

                        if (!entity) {
                            return response.formatter.notFound(
                                `Could not find resourceName with ID of ${params.id}`
                            )
                        }

                        await modelRepository.removeAndFlush(entity)
                        return response.formatter.noContent({})
                    })
            )
        })

        return routes
    }

    plugin() {
        return plugin('Rest API')
            .afterDatabaseSetup(
                async ({ extendRoutes, resources, apiPath, app }) => {
                    app.use(responseEnhancer())
                    extendRoutes(
                        this.extendRoutes(resources, (path: string) =>
                            this.getApiPath(apiPath, path)
                        )
                    )
                }
            )
            .setup(async ({ app, routes }) => {
                routes.forEach(route => {
                    ; (app as any)[route.config.type.toLowerCase()](
                        route.config.path,
                        ...route.config.middleware.map(fn => AsyncHandler(fn)),
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
