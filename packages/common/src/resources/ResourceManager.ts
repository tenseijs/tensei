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

    public async deleteById(
        request: Request,
        resourceSlugOrResource: string | Resource,
        id: number | string
    ) {
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

    public async update(
        request: Request,
        resourceSlugOrResource: string | Resource,
        id: number | string,
        payload: DataPayload
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const validatedPayload = await this.validate(
            payload,
            resource,
            false,
            id
        )

        const parsedPayload = resource.hooks.beforeUpdate(
            validatedPayload,
            request
        )

        await this.db.updateManyByIds(resource, [id as number], parsedPayload)

        await this.updateRelationshipFields(resource, payload, id)
    }

    public async updateRelationshipFields(
        resource: Resource,
        payload: DataPayload,
        modelId: string | number
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

            if (!relatedResource) {
                throw [
                    {
                        message: `The related resource ${field.name} was not found.`,
                    },
                ]
            }

            if (field.component === 'HasManyField') {
                // first we'll set all related belongs to values to null on the related resource
                const relatedBelongsToField = relatedResource.data.fields.find(
                    (field) =>
                        field.component === 'BelongsToField' &&
                        field.name === resource.data.name
                )

                if (!relatedBelongsToField) {
                    throw [
                        {
                            message: `A related BelongsTo relationship must be registered on the ${relatedResource.data.name} resource. This will link the ${resource.data.name} to the ${relatedResource.data.name} resource.`,
                        },
                    ]
                }

                // go to posts table, find all related posts and update the user_id field to be the null
                await this.db.updateManyWhere(
                    relatedResource,
                    { [relatedBelongsToField.databaseField]: modelId },
                    { [relatedBelongsToField.databaseField]: null }
                )

                // finally, go to posts table, find all related posts (new ones from request body) and update the user_id field to be modelId
                await this.db.updateManyByIds(
                    relatedResource,
                    relationshipFieldsPayload[field.inputName],
                    {
                        [relatedBelongsToField.databaseField]: modelId,
                    }
                )
            }
        }
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

            if (!relatedResource) {
                throw [
                    {
                        message: `The related resource ${field.name} was not found.`,
                    },
                ]
            }

            if (field.component === 'HasManyField') {
                const relatedBelongsToField = relatedResource.data.fields.find(
                    (field) =>
                        field.component === 'BelongsToField' &&
                        field.name === resource.data.name
                )

                if (!relatedBelongsToField) {
                    throw [
                        {
                            message: `A related BelongsTo relationship must be registered on the ${relatedResource.data.name} resource. This will link the ${resource.data.name} to the ${relatedResource.data.name} resource.`,
                        },
                    ]
                }
                const valuesToUpdate: DataPayload = {
                    [relatedBelongsToField.databaseField]: model.id,
                }

                // go to posts table, find all related posts and update the user_id field to be the model.id
                this.db.updateManyByIds(
                    relatedResource,
                    relationshipFieldsPayload[field.inputName],
                    valuesToUpdate
                )
            }
        }
    }

    public async validateRequestQuery(
        {
            perPage,
            page,
            fields,
            search,
            noPagination = 'false',
            ...rest
        }: Request['query'],
        resource: Resource
    ) {
        let whereQueries: Array<{
            field: string
            value: string
        }> = []

        Object.keys(rest).forEach((queryParam) => {
            if (queryParam.match(/where_/i) && rest[queryParam]) {
                whereQueries.push({
                    field: queryParam.split('where_')[1],
                    value: rest[queryParam] as string,
                })
            }
        })

        const validFields = resource.data.fields.map(
            (field) => field.databaseField
        )

        const parsedQuery = await validateAll(
            {
                perPage,
                page,
                search,
                noPagination,
                whereQueries,
                fields: (fields as string)?.split(','),
            },
            {
                perPage: 'number',
                page: 'number',
                fields: 'array',
                search: 'string',
                whereQueries: 'array',
                'whereQueries.*.field': 'required|string,in:' + validFields,
                'whereQueries.*.value': 'required|string,',
                noPagination: 'string,in:true,false',
                'fields.*': 'in:' + validFields,
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
            whereQueries,
            noPagination,
        } = await this.validateRequestQuery(request.query, resource)

        return this.db.findAll(resource, {
            perPage: perPage || resource.data.perPageOptions[0] || 10,
            page: page || 1,
            fields,
            search,
            whereQueries,
            noPagination,
        })
    }

    public async findOneById(
        request: Request,
        resourceSlugOrResource: string | Resource,
        id: number | string
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const { fields } = await this.validateRequestQuery(
            request.query,
            resource
        )

        const model = await this.db.findOneById(resource, id, fields)

        if (!model) {
            throw {
                message: `Could not find a resource with id ${id}`,
                status: 404,
            }
        }

        return model
    }

    getValidationRules = (resource: Resource, creationRules = true) => {
        const fields = resource.data.fields.filter((field) =>
            creationRules
                ? field.showHideField.showOnCreation
                : field.showHideField.showOnUpdate
        )

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
        creationRules: boolean = true,
        modelId?: string | number
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

        await this.validateUniqueFields(
            nonRelationshipFieldsPayload,
            resource,
            creationRules,
            modelId
        )

        // then we need to validate all unique fields.
        return parsedPayload
    }

    validateUniqueFields = async (
        payload: DataPayload,
        resource: Resource,
        creationRules = true,
        modelId?: string | number
    ) => {
        const uniqueFields = resource
            .serialize()
            .fields.filter(
                (field) => field.isUnique && !field.isRelationshipField
            )

        for (let index = 0; index < uniqueFields.length; index++) {
            const field = uniqueFields[index]

            let exists: null | {} = null

            if (creationRules) {
                exists = await this.db.findOneByField(
                    resource,
                    field.databaseField,
                    payload[field.inputName],
                    ['id']
                )
            } else {
                exists = await this.db.findOneByFieldExcludingOne(
                    resource,
                    field.databaseField,
                    payload[field.inputName],
                    modelId!,
                    ['id']
                )
            }

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
