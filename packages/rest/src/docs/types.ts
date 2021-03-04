export interface Route {
    authorize: number
    id: string
    middleware: number
    name: string
    description: string
    group: string
    groupSlug: string
    paramCaseName: string
    path: string
    snakeCaseName: string
    sampleRequest: string
    sampleResponse: string
    parameters: RouteParameter[]
    type: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

export interface RouteParameter {
    name: string
    type: string | number
    description: string
    validation?: string[]
    in: 'header' | 'body' | 'query' | 'path'
}

export interface RouteGroup {
    [key: string]: {
        routes: Route[]
        slug: string
        name: string
    }
}
