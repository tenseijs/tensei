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
        paths: {}
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
            if (['m:n', '1:m'].includes(field.relatedProperty.reference!)) {
                property.type = 'array'
                property.items = {
                    $ref: `#/definitions/ID`
                }
            } else {
                property.$ref = `#/definitions/ID`
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
        return plugin('API Documentation').setup(
            async ({ app, resources, routes }) => {
                this.docs.definitions.ID = {
                    type: 'string'
                }

                resources
                    .filter(r => !r.data.hideFromApi)
                    .forEach(resource => {
                        const properties: any = {}
                        const inputProperties: any = {}

                        resource.data.fields.forEach(field => {
                            properties[
                                field.databaseField
                            ] = this.getPropertyFromField(resources, field)
                        })

                        resource.data.fields
                            .filter(f => !f.property.primary)
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
                    })

                routes.forEach(route => {
                    if (route.config.extend.docs) {
                        this.docs.tags
                    }

                    const inputProperties: any[] = []

                    if (
                        ['POST', 'PATCH', 'PUT'].includes(route.config.type) &&
                        route.config.internal
                    ) {
                        route.config.resource?.data.fields
                            .filter(f => !f.property.primary)
                            .forEach(field => {
                                inputProperties.push({
                                    ...this.getPropertyFromField(
                                        resources,
                                        field,
                                        true
                                    ),
                                    name: field.databaseField,
                                    required:
                                        !field.property.nullable &&
                                        !field.relatedProperty.reference &&
                                        !['PATCH', 'PUT'].includes(
                                            route.config.type
                                        ),
                                    in: 'body'
                                })
                            })
                    }

                    if (
                        route.config.type === 'DELETE' &&
                        route.config.internal
                    ) {
                        inputProperties.push({
                            required: true,
                            name: 'id',
                            in: 'path'
                        })
                    }

                    this.docs.paths[
                        route.config.path
                            .replace(':id', '{id}')
                            .replace(':related-resource', '{related-resource}')
                    ] = {
                        ...(this.docs.paths[route.config.path] || {}),
                        [route.config.type.toLowerCase()]: {
                            consumes: ['application/json'],
                            produces: ['application/json'],
                            tags: route.config.resource
                                ? [route.config.resource.data.label]
                                : route.config.extend?.docs?.tags || [],
                            ...(route.config.extend.docs || {}),
                            parameters: inputProperties
                        }
                    }
                })

                const router = Router()

                const path = this.docsPath.startsWith('/')
                    ? this.docsPath
                    : `/${this.docsPath}`

                router.use(path, Ui.serve)
                router.get(path, Ui.setup(this.docs))

                app.use(router)
            }
        )
    }
}

export const docs = () => new Docs()
