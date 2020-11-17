import { snakeCase, paramCase } from 'change-case'
import {
    AuthorizeFunction,
    GraphQlQueryConfig,
    GraphQlQueryContract,
    ResourceContract
} from '@tensei/common'

export class GraphQlQuery implements GraphQlQueryContract {
    public config: GraphQlQueryConfig = {
        path: '',
        name: '',
        type: 'QUERY',
        snakeCaseName: '',
        paramCaseName: '',
        authorize: [],
        handler: async () => {}
    }

    constructor(name?: string) {
        if (!name) {
            return
        }

        this.config.name = name
        this.config.paramCaseName = paramCase(name)
        this.config.snakeCaseName = snakeCase(name)
    }

    resource(resource: ResourceContract) {
        this.config.resource = resource

        return this
    }

    path(path: string) {
        this.config.path = path

        return this
    }

    query() {
        this.config.type = 'QUERY'

        return this
    }

    mutation() {
        this.config.type = 'MUTATION'

        return this
    }

    authorize(authorize: AuthorizeFunction) {
        this.config.authorize = [...this.config.authorize, authorize]

        return this
    }

    handle(handler: GraphQlQueryConfig['handler']) {
        this.config.handler = handler

        return this
    }
}

export const graphQlQuery = (name?: string) => new GraphQlQuery(name)
