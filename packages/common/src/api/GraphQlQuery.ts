import { snakeCase, paramCase } from 'change-case'
import {
  AuthorizeFunction,
  GraphQlQueryConfig,
  GraphQlQueryContract,
  ResourceContract,
  GraphQlMiddleware
} from '@tensei/common'

export class GraphQlQuery implements GraphQlQueryContract {
  public config: GraphQlQueryConfig = {
    path: '',
    name: '',
    internal: false,
    type: 'QUERY',
    middleware: [],
    snakeCaseName: '',
    paramCaseName: '',
    authorize: [],
    filter: () => true,
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

  subscription() {
    this.config.type = 'SUBSCRIPTION'

    return this
  }

  authorize(authorize: AuthorizeFunction) {
    this.config.authorize = [...this.config.authorize, authorize]

    return this
  }

  middleware(...middleware: GraphQlMiddleware[]) {
    this.config.middleware = [...this.config.middleware, ...middleware]

    return this
  }

  handle(handler: GraphQlQueryConfig['handler']) {
    this.config.handler = handler

    return this
  }

  filter(filter: GraphQlQueryConfig['filter']) {
    this.config.filter = filter

    return this
  }

  internal() {
    this.config.internal = true

    return this
  }
}

export const graphQlQuery = (name?: string) => new GraphQlQuery(name)
