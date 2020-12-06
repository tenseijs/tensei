import { snakeCase, paramCase } from 'change-case'
import {
    RouteConfig,
    AuthorizeFunction,
    RouteContract,
    ResourceContract,
    RouteExtendContract
} from '@tensei/common'
import { RequestHandler } from 'express'

export class Route implements RouteContract {
    public config: RouteConfig & {
        extend: RouteExtendContract
    } = {
        path: '',
        name: '',
        cms: false,
        type: 'GET',
        internal: false,
        middleware: [],
        snakeCaseName: '',
        paramCaseName: '',
        authorize: [],
        handler: async () => {},
        extend: {}
    }

    constructor(name?: string) {
        if (!name) {
            return
        }

        this.config.name = name
        this.config.paramCaseName = paramCase(name)
        this.config.snakeCaseName = snakeCase(name)
    }

    path(path: string) {
        this.config.path = path

        return this
    }

    cms() {
        this.config.cms = true

        return this
    }

    get() {
        this.config.type = 'GET'

        return this
    }

    post() {
        this.config.type = 'POST'

        return this
    }

    put() {
        this.config.type = 'PUT'

        return this
    }

    patch() {
        this.config.type = 'PATCH'

        return this
    }

    delete() {
        this.config.type = 'DELETE'

        return this
    }

    authorize(authorize: AuthorizeFunction) {
        this.config.authorize = [...this.config.authorize, authorize]

        return this
    }

    resource(resource: ResourceContract) {
        this.config.resource = resource

        return this
    }

    middleware(middleware: RequestHandler[]) {
        this.config.middleware = [...this.config.middleware, ...middleware]

        return this
    }

    handle(handler: RouteConfig['handler']) {
        this.config.handler = handler

        return this
    }

    internal() {
        this.config.internal = true

        return this
    }

    extend(extend: RouteExtendContract) {
        this.config.extend = extend

        return this
    }
}

export const route = (name?: string) => new Route(name)
