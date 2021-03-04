import { snakeCase, paramCase } from 'change-case'
import {
    RouteConfig,
    AuthorizeFunction,
    RouteContract,
    RouteParameter,
    ResourceContract,
    RouteExtendContract
} from '@tensei/common'
import { RequestHandler } from 'express'

export class Route implements RouteContract {
    public config: RouteConfig & {
        extend: RouteExtendContract
    } = {
        id: '',
        path: '',
        name: '',
        cms: false,
        type: 'GET',
        group: 'Misc',
        groupSlug: 'misc',
        internal: false,
        middleware: [],
        parameters: [],
        snakeCaseName: '',
        paramCaseName: '',
        authorize: [],
        description: '',
        handler: async () => {},
        extend: {},
        sampleRequest: '',
        sampleResponse: ''
    }

    sampleRequest(sample: string) {
        this.config.sampleRequest = sample

        return this
    }

    sampleResponse(sample: string) {
        this.config.sampleResponse = sample

        return this
    }

    constructor(name?: string) {
        if (!name) {
            return
        }

        this.config.name = name
        this.config.paramCaseName = paramCase(name)
        this.config.snakeCaseName = snakeCase(name)
    }

    group(name: string) {
        this.config.group = name
        this.config.groupSlug = paramCase(name)

        return this
    }

    parameters(parameters: RouteParameter[]) {
        this.config.parameters = [...this.config.parameters, ...parameters]

        return this
    }

    description(description: string) {
        this.config.description = description

        return this
    }

    path(path: string) {
        this.config.path = path.startsWith('/') ? path.substring(1) : path

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

    id(id: string) {
        this.config.id = id

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

    serialize() {
        const {
            id,
            path,
            name,
            type,
            snakeCaseName,
            middleware,
            paramCaseName,
            authorize,
            group,
            groupSlug,
            parameters,
            description,
            sampleRequest,
            sampleResponse
        } = this.config

        return {
            id,
            path,
            name,
            type,
            group,
            groupSlug,
            parameters,
            description,
            snakeCaseName,
            paramCaseName,
            sampleRequest,
            sampleResponse,
            middleware: middleware.length,
            authorize: authorize.length
        }
    }
}

export const route = (name?: string) => new Route(name)
