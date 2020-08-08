import { Request } from 'express'
import { Resource } from './Resource'
import { validateAll } from 'indicative/validator'
import { DataPayload, ValidationError } from '../config'
import { DatabaseRepositoryInterface } from '../databases/DatabaseRepositoryInterface'

export class ResourceManager {
    constructor(
        private resources: Resource[],
        private db: DatabaseRepositoryInterface
    ) {}

    private findResource = (resourceSlug: string | Resource) => {
        if (typeof resourceSlug !== 'string') {
            return resourceSlug
        }

        const resource = this.resources.find(
            (resource) => resource.data.slug === resourceSlug
        )

        if (!resource) {
            throw new Error(`Resource ${resourceSlug} not found.`)
        }

        return resource
    }

    public async deleteById(request: Request, resourceSlugOrResource: string | Resource, id: number|string) {
        const resource = this.findResource(resourceSlugOrResource)

        await this.db.deleteById(resource, id)
    }

    public async create(
        request: Request,
        resourceSlugOrResource: string | Resource,
        payload: DataPayload
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const validatedPayload = await this.validate(payload, resource)

        const parsedPayload = resource.hooks.beforeCreate(
            validatedPayload,
            request
        )

        const model = await this.db.create(resource, parsedPayload)

        await this.createRelationalFields(resource, payload, model)

        return model
    }

    public async createRelationalFields(
        resource: Resource,
        payload: DataPayload,
        model: any
    ) {
        const {
            relationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            this.getResourceFieldsFromPayload(payload, resource),
            resource
        )

        const relationshipFields = resource
            .serialize()
            .fields.filter((field) => field.isRelationshipField)

        for (let index = 0; index < relationshipFields.length; index++) {
            const field = relationshipFields[index]
            const relatedResource = this.resources.find(
                (relatedResource) => relatedResource.data.name === field.name
            )

            if (! relatedResource) {
                throw [{
                    message: `The related resource ${field.name} was not found.`
                }]
            }

            if (field.component === 'HasManyField') {
                const relatedBelongsToField = relatedResource.data.fields.find(field => field.component === 'BelongsToField' && field.name === resource.data.name)

                if (! relatedBelongsToField) {
                    throw [{
                        message: `A related BelongsTo relationship must be registered on the ${relatedResource.data.name} resource. This will link the ${resource.data.name} to the ${relatedResource.data.name} resource.`
                    }]
                }
                const valuesToUpdate: DataPayload = {
                    [relatedBelongsToField.databaseField]: model.id
                }

                // go to posts table, find all related posts and update the user_id field to be the model.id
                this.db.updateManyByIds(relatedResource, relationshipFieldsPayload[field.inputName], valuesToUpdate)
            }
        }
    }

    public async validateRequestQuery(
        { perPage, page, fields, search }: Request['query'],
        resource: Resource
    ) {
        const parsedQuery = await validateAll(
            {
                perPage,
                page,
                search,
                fields: (fields as string)?.split(','),
            },
            {
                perPage: 'number',
                page: 'number',
                fields: 'array',
                search: 'string',
                'fields.*':
                    'in:' +
                    resource.data.fields.map((field) => field.databaseField),
            }
        )

        return parsedQuery
    }

    public async findAll(
        request: Request,
        resourceSlugOrResource: string | Resource
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const {
            perPage,
            page,
            fields,
            search,
        } = await this.validateRequestQuery(request.query, resource)

        return this.db.findAll(resource, {
            perPage: perPage || resource.data.perPageOptions[0] || 10,
            page: page || 1,
            fields,
            search,
        })
    }

    public async findOneById(
        request: Request,
        resourceSlugOrResource: string | Resource,
        id: number|string
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        return this.db.findOneById(resource, id)
    }

    getValidationRules = (resource: Resource, creationRules = true) => {
        const { fields } = resource.data

        const rules: {
            [key: string]: string
        } = {}

        fields.forEach((field) => {
            const serializedField = field.serialize()

            const fieldValidationRules = Array.from(
                new Set([
                    ...serializedField.rules,
                    ...serializedField[
                        creationRules ? 'creationRules' : 'updateRules'
                    ],
                ])
            ).join('|')

            if (fieldValidationRules) {
                rules[serializedField.inputName] = fieldValidationRules
            }
        })

        return rules
    }

    getResourceFieldsFromPayload = (
        payload: DataPayload,
        resource: Resource
    ) => {
        let validPayload: DataPayload = {}

        resource.data.fields.forEach((field) => {
            const serializedField = field.serialize()

            if (payload[serializedField.inputName]) {
                validPayload[serializedField.inputName] =
                    payload[serializedField.inputName]
            }
        })

        return validPayload
    }

    breakFieldsIntoRelationshipsAndNonRelationships = (
        payload: DataPayload,
        resource: Resource
    ) => {
        const relationshipFieldsPayload: DataPayload = {}
        const nonRelationshipFieldsPayload: DataPayload = {}

        resource.data.fields.forEach((field) => {
            const serializedField = field.serialize()

            if (payload[serializedField.inputName]) {
                if (serializedField.isRelationshipField) {
                    relationshipFieldsPayload[serializedField.inputName] =
                        payload[serializedField.inputName]
                } else {
                    nonRelationshipFieldsPayload[serializedField.inputName] =
                        payload[serializedField.inputName]
                }
            }
        })

        return {
            relationshipFieldsPayload,
            nonRelationshipFieldsPayload,
        }
    }

    validate = async (
        payload: DataPayload,
        resource: Resource,
        creationRules: boolean = true
    ): Promise<DataPayload> => {
        const {
            relationshipFieldsPayload,
            nonRelationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            this.getResourceFieldsFromPayload(payload, resource),
            resource
        )

        const parsedPayload: DataPayload = await validateAll(
            nonRelationshipFieldsPayload,
            this.getValidationRules(resource, creationRules),
            resource.data.validationMessages
        )

        await this.validateRelationshipFields(
            relationshipFieldsPayload,
            resource
        )

        await this.validateUniqueFields(nonRelationshipFieldsPayload, resource)

        // then we need to validate all unique fields.
        return parsedPayload
    }

    validateUniqueFields = async (payload: DataPayload, resource: Resource) => {
        const uniqueFields = resource
            .serialize()
            .fields.filter(
                (field) => field.isUnique && !field.isRelationshipField
            )

        for (let index = 0; index < uniqueFields.length; index++) {
            const field = uniqueFields[index]

            const exists = await this.db.findOneByField(
                resource,
                field.databaseField,
                payload[field.inputName],
                ['id']
            )

            if (exists) {
                throw [
                    {
                        message: `A ${resource.data.name.toLowerCase()} already exists with ${
                            field.inputName
                        } ${payload[field.inputName]}.`,
                        field: field.inputName,
                    },
                ]
            }
        }
    }

    validateRelationshipFields = async (
        payload: DataPayload,
        resource: Resource
    ) => {
        const fields = resource.data.fields
            .map((field) => field.serialize())
            .filter((field) => field.isRelationshipField)

        for (let index = 0; index < fields.length; index++) {
            const field = fields[index]
            const relatedResource = this.resources.find(
                (relatedResource) => relatedResource.data.name === field.name
            )

            if (!relatedResource) {
                throw [
                    {
                        message: `The related resource ${field.name} could not be found.`,
                        field: field.inputName,
                    },
                ]
            }

            if (field.component === 'HasManyField') {
                const allRelatedRows = await this.db.findAllByIds(
                    relatedResource,
                    payload[field.inputName],
                    ['id']
                )

                if (allRelatedRows.length !== payload[field.inputName].length) {
                    throw [
                        {
                            message: `Invalid values were provided for the related resource. Make sure all values provided exist in the database table ${relatedResource.data.table}`,
                            field: field.inputName,
                        },
                    ]
                }
            }

            if (field.component === 'BelongsToField') {
                if (
                    !(await this.db.findOneById(
                        relatedResource,
                        payload[field.inputName],
                        ['id']
                    ))
                ) {
                    throw []
                }
            }
        }
    }
}
