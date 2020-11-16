import { Request, Response } from 'express'
import { FindOptions } from '@mikro-orm/core'
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

        if (query.populate) {
            findOptions.populate = query.populate.split(',')
        }

        if (query.fields) {
            findOptions.fields = query.fields.split(',')
        }

        if (query.filters) {
            findOptions.filters = query.filters.split(',')
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
                    .handle(async ({ manager, query }, response) => {
                        const findOptions = this.parseQueryToFindOptions(
                            query,
                            resource
                        )

                        const [entities, total] = await manager.findAndCount(
                            modelName,
                            {},
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
                    .handle(async ({ manager, params }, response) => {
                        const entity = await manager.findOneOrFail(modelName, {
                            id: params.id
                        })

                        return response.formatter.ok(entity)
                    })
            )

            routes.push(
                route(`Update single ${singular}`)
                    .put()
                    .resource(resource)
                    .path(getApiPath(`${plural}/:id`))
                    .handle(async ({ manager, params, body }, response) => {
                        const entity = await manager.findOneOrFail(modelName, {
                            id: params.id
                        })

                        manager.assign(entity, body)

                        await manager.persistAndFlush(entity)

                        return response.formatter.ok(entity)
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
                    ;(app as any)[route.config.type.toLowerCase()](
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
