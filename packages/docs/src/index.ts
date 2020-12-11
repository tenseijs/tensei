import { Router } from 'express'
import Ui from 'swagger-ui-express'
import { plugin, FieldContract, ResourceContract } from '@tensei/common'

class Docs {
    private docs: any = {
        swagger: '2.0',
        info: {
            license: {},
            contact: {}
        },
        tags: [],
        definitions: {},
        paths: {},
        components: {
            securitySchemes: {
                bearerAuth: {
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        securityDefinitions: {
            Bearer: {
                in: 'header',
                type: 'apiKey',
                name: 'Authorization'
            }
        }
    }

    private logoUrl: string = ''

    private docsPath: string = '/docs'

    version(version: string) {
        this.docs.version = version

        return this
    }

    path(path: string) {
        this.docsPath = path

        return this
    }

    title(title: string) {
        this.docs.info = {
            ...this.docs.info,
            title
        }

        return this
    }

    termsOfService(termsOfService: string) {
        this.docs.info = {
            ...this.docs.info,
            termsOfService
        }

        return this
    }

    contactName(name: string) {
        this.docs.info = {
            ...this.docs.info,
            contact: {
                ...this.docs.info.contact,
                name
            }
        }
    }

    contactEmail(email: string) {
        this.docs.info = {
            ...this.docs.info,
            contact: {
                ...this.docs.info.contact,
                email
            }
        }
    }

    contactUrl(url: string) {
        this.docs.info = {
            ...this.docs.info,
            contact: {
                ...this.docs.info.contact,
                url
            }
        }
    }

    licenseName(name: string) {
        this.docs.info = {
            ...this.docs.info,
            license: {
                ...this.docs.info.license,
                name
            }
        }
    }

    licenseUrl(url: string) {
        this.docs.info = {
            ...this.docs.info,
            license: {
                ...this.docs.info.license,
                url
            }
        }
    }

    private getPropertyFromField(
        resources: ResourceContract[],
        field: FieldContract,
        input = false
    ) {
        let property: any = {}

        property.description = field.helpText

        if (field.property.enum) {
            property.enum = field.property.items?.map(i => i)
        }

        if (field.relatedProperty.type) {
            const relatedResource = resources.find(r =>
                [r.data.name, r.data.pascalCaseName].includes(
                    field.relatedProperty.type!
                )
            )
            if (['m:n', '1:m'].includes(field.relatedProperty.reference!)) {
                property.type = 'array'
                property.items = {
                    $ref: `#/definitions/${
                        input ? 'ID' : relatedResource?.data.pascalCaseName
                    }`
                }
            } else {
                property.$ref = `#/definitions/${
                    input ? 'ID' : relatedResource?.data.pascalCaseName
                }`
            }

            return property
        }

        if (['string', 'date', 'datetime'].includes(field.property.type!)) {
            property.type = 'string'
            property.format = field.property.type

            return property
        }

        if (['number', 'integer'].includes(field.property.type!)) {
            property.type = 'integer'
            property.format = 'int32'

            return property
        }

        if (['boolean'].includes(field.property.type!)) {
            property.type = 'boolean'

            return property
        }

        return property
    }

    logo(logo: string) {
        this.logoUrl = logo

        return this
    }

    plugin() {
        return plugin('Rest API Documentation').boot(
            async ({ app, resources, routes }) => {
                this.docs.definitions.ID = {
                    type: 'string'
                }

                this.docs.definitions.PaginationMeta = {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer'
                        },
                        per_page: {
                            type: 'integer'
                        },
                        page_count: {
                            type: 'integer'
                        },
                        total: {
                            type: 'integer'
                        }
                    }
                }

                resources
                    .filter(r => !r.isHiddenOnApi())
                    .forEach(resource => {
                        const properties: any = {}
                        const inputProperties: any = {}

                        resource.data.fields
                            .filter(f => !f.isHiddenOnApi())
                            .forEach(field => {
                                properties[
                                    field.databaseField
                                ] = this.getPropertyFromField(resources, field)
                            })

                        resource.data.fields
                            .filter(
                                f =>
                                    !f.property.primary &&
                                    !f.property.hidden &&
                                    !f.showHideFieldFromApi.hideOnInsertApi &&
                                    !f.showHideFieldFromApi.hideOnUpdateApi
                            )
                            .forEach(field => {
                                inputProperties[
                                    field.databaseField
                                ] = this.getPropertyFromField(
                                    resources,
                                    field,
                                    true
                                )
                            })

                        this.docs.tags.push({
                            name: resource.data.label
                        })

                        this.docs.definitions[resource.data.pascalCaseName] = {
                            type: 'object',
                            properties
                        }

                        this.docs.definitions[
                            `${resource.data.pascalCaseName}Input`
                        ] = {
                            type: 'object',
                            properties: inputProperties,
                            required: resource.data.fields
                                .filter(f => {
                                    if (
                                        ['1:m', 'm:n'].includes(
                                            f.relatedProperty.reference!
                                        )
                                    ) {
                                        return false
                                    }

                                    return (
                                        !f.property.nullable ||
                                        f.validationRules.includes('required')
                                    )
                                })
                                .map(f => f.databaseField)
                        }

                        this.docs.definitions[
                            `${resource.data.pascalCaseName}FetchResponse`
                        ] = {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'array',
                                    items: {
                                        $ref: `#/definitions/${resource.data.pascalCaseName}`
                                    }
                                },
                                meta: {
                                    type: 'object',
                                    $ref: `#/definitions/PaginationMeta`
                                }
                            }
                        }
                    })

                routes.forEach(route => {
                    const inputProperties: any[] = []
                    const responseTypes: any = {
                        500: {
                            description: 'Server error.'
                        }
                    }

                    const queryArgumentsForFetchQuery = [
                        {
                            type: 'deepObject',
                            required: false,
                            name: 'where',
                            in: 'query',
                            description:
                                'This should be a JSON stringified version of a valid query object, for example: {"name":{"$eq":"string"}}'
                        },
                        {
                            type: 'integer',
                            required: false,
                            name: 'page',
                            in: 'query'
                        },
                        {
                            type: 'integer',
                            required: false,
                            name: 'per_page',
                            in: 'query'
                        },
                        {
                            type: 'string',
                            required: false,
                            name: 'populate',
                            in: 'query'
                        },
                        {
                            type: 'string',
                            required: false,
                            name: 'fields',
                            in: 'query'
                        }
                    ]

                    if (route.config.internal) {
                        if (
                            ['POST', 'PATCH', 'PUT'].includes(route.config.type)
                        ) {
                            inputProperties.push({
                                required: true,
                                name: 'body',
                                in: 'body',
                                schema: {
                                    $ref: `#/definitions/${route.config.resource?.data?.pascalCaseName}Input`
                                }
                            })

                            if (['PUT', 'PATCH'].includes(route.config.type)) {
                                inputProperties.push(
                                    {
                                        required: true,
                                        name: 'id',
                                        in: 'path'
                                    },
                                    {
                                        type: 'string',
                                        required: false,
                                        name: 'populate',
                                        in: 'query'
                                    }
                                )

                                responseTypes[404] = {
                                    description: `The ${route.config.resource?.data.pascalCaseName} was not found.`
                                }

                                responseTypes[200] = {
                                    description: 'The operation was successful.'
                                }
                                responseTypes[422] = {
                                    description:
                                        'Validation errors were found with the data provided.'
                                }
                            } else {
                                responseTypes['201'] = {
                                    description: 'The operation was successful.'
                                }
                                responseTypes['422'] = {
                                    description:
                                        'Validation errors were found with the data provided.'
                                }
                            }
                        } else if (
                            ['DELETE', 'GET'].includes(route.config.type) &&
                            !!route.config.path.match(/:id/)
                        ) {
                            inputProperties.push(
                                {
                                    required: true,
                                    name: 'id',
                                    in: 'path'
                                },
                                {
                                    type: 'string',
                                    required: false,
                                    name: 'populate',
                                    in: 'query'
                                }
                            )

                            responseTypes[404] = {
                                description: `The ${route.config.resource?.data.snakeCaseName} was not found.`
                            }

                            if (!!route.config.path.match(/:relatedResource/)) {
                                inputProperties.push(
                                    {
                                        required: true,
                                        name: 'relatedResource',
                                        in: 'path'
                                    },
                                    ...queryArgumentsForFetchQuery
                                )
                            }
                        } else {
                            inputProperties.push(...queryArgumentsForFetchQuery)
                        }
                    }

                    const parsedPath = route.config.path
                        .replace(':id', '{id}')
                        .replace(':relatedResource', '{relatedResource}')

                    this.docs.paths[parsedPath] = {
                        ...(this.docs.paths[parsedPath] || {}),
                        [route.config.type.toLowerCase()]: {
                            consumes: ['application/json'],
                            produces: ['application/json'],
                            tags: route.config.resource
                                ? [route.config.resource.data.label]
                                : route.config.extend?.docs?.tags || [],
                            ...(route.config.extend.docs || {}),
                            parameters: route.config.extend?.docs?.parameters
                                ? route.config.extend.docs?.parameters
                                : inputProperties,
                            responses: {
                                ...responseTypes,
                                ...(route.config.extend?.docs?.responses || {})
                            }
                        }
                    }

                    if (route.config.extend.docs?.definitions) {
                        this.docs.definitions = {
                            ...this.docs.definitions,
                            ...route.config.extend.docs?.definitions
                        }
                    }
                })

                const router = Router()

                const path = this.docsPath.startsWith('/')
                    ? this.docsPath
                    : `/${this.docsPath}`

                router.use(path, Ui.serve)
                router.get(path, Ui.setup(this.docs))

                app.get(`${path}.json`, (_, resp) => resp.json(this.docs))

                app.use(router)
            }
        )
    }
}

export const docs = () => new Docs()
