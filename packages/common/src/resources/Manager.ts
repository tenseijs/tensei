import { Request } from 'express'
import { validateAll } from 'indicative/validator'
import { resource as createResourceFn } from './Resource'
import { DataPayload, FetchAllRequestQuery } from '@tensei/common'
import {
    ActionResponse,
    DatabaseRepositoryInterface,
    ResourceContract,
    ManagerContract,
} from '@tensei/common'
import { ResourceHelpers } from '../helpers'

export class Manager extends ResourceHelpers implements ManagerContract {
    constructor(
<<<<<<< HEAD
        private request: Request,
        resources: ResourceContract[],
        public repository: DatabaseRepositoryInterface
    ) {
        super(resources)
=======
        private resources: ResourceContract[],
        public database: DatabaseRepositoryInterface
    ) { }

    public findResource = (resourceSlug: string | ResourceContract) => {
        if (!resourceSlug) {
            throw {
                message: `Resource ${resourceSlug} not found.`,
                status: 404,
            }
        }

        if (typeof resourceSlug !== 'string') {
            return resourceSlug
        }

        const resource = this.resources.find(
            (resource) => resource.data.slug === resourceSlug
        )

        if (!resource) {
            throw {
                message: `Resource ${resourceSlug} not found.`,
                status: 404,
            }
        }

        return resource
>>>>>>> add tests for manager class
    }

    public async deleteById(
        id: number | string
    ) {
        return this.database().deleteById(id)
    }

    public database = (resource = this.getCurrentResource()) => {
        return this.repository.setResource(resource)
    }

    public async create(
        payload: DataPayload
    ) {
        const resource = this.getCurrentResource()

        let validatedPayload = await this.validate(payload)

        const {
            nonRelationshipFieldsPayload,
            relationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            await resource.hooks.beforeCreate(
                {
                    ...validatedPayload.parsedPayload,
                    ...validatedPayload.relationshipFieldsPayload,
                },
                this.request
            ),
        )

        // TODO: Insert beforeCreate hook for fields here.

        const model = await this.database().create(
            nonRelationshipFieldsPayload,
            relationshipFieldsPayload
        )

        return model
    }

    public async updateOneByField(
        databaseField: string,
        value: any,
        payload: DataPayload
    ) {
        const resource = this.getCurrentResource()

        const field = this.getFieldFromResource(resource, databaseField)

        if (!field) {
            throw new Error(
                `The field ${databaseField} does not exist on resource ${resource.data.name}.`
            )
        }

        let { parsedPayload } = await this.validate(payload, false)

        return this.database().updateOneByField(
            field.databaseField,
            value,
            parsedPayload
        )
    }

    public async update(
        id: number | string,
        payload: DataPayload,
        patch = true
    ) {
        const resource = this.getCurrentResource()

        let { parsedPayload, relationshipFieldsPayload } = await this.validate(
            payload,
            false,
            id
        )

        parsedPayload = resource.hooks.beforeUpdate(parsedPayload, this.request)

        // TODO: Add beforeUpdate hook for fields.

        return this.database().update(
            id,
            parsedPayload,
            relationshipFieldsPayload,
            patch
        )
    }

    public async updateRelationshipFields(
        payload: DataPayload,
        modelId: string | number
    ) {
        const resource = this.getCurrentResource()

        const {
            relationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            this.getResourceFieldsFromPayload(payload),
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
                await this.database().updateManyWhere(
                    { [relatedBelongsToField.databaseField]: modelId },
                    { [relatedBelongsToField.databaseField]: null }
                )

                // finally, go to posts table, find all related posts (new ones from request body) and update the user_id field to be modelId
                await this.database().updateManyByIds(
                    relationshipFieldsPayload[field.inputName],
                    {
                        [relatedBelongsToField.databaseField]: modelId,
                    }
                )
            }
        }
    }

    public async createRelationalFields(
        payload: DataPayload,
        model: any
    ) {
        const resource = this.getCurrentResource()

        const {
            relationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            this.getResourceFieldsFromPayload(payload),
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
                this.database().updateManyByIds(
                    relationshipFieldsPayload[field.inputName],
                    valuesToUpdate
                )
            }
        }
    }

    public async validateRequestQuery(
        {
            per_page: perPage,
            page,
            fields,
            search,
            filter,
            with: withRelationships,
            no_pagination: noPagination = 'false',
        }: Request['query'],
        resource = this.getCurrentResource()
    ) {
        let filters: FetchAllRequestQuery['filters'] = []

        if (typeof filter === 'object') {
            Object.keys(filter || {}).forEach((filterKey) => {
                const [field, operator] = filterKey.split(':')

                filters.push({
                    field,
                    operator: (operator as any) || 'equals',
                    value: ((filter || {}) as any)[filterKey],
                })
            })
        }

        const supportedOperators = [
            'equals',
            'contains',
            'not_equals',
            'exists',
            'doesnt_exist',
            'null',
            'not_null',
            'gt',
            'gte',
            'lt',
            'lte',
            'matches',
        ]

        const validFields = resource
            .serialize()
            .fields.filter((field) => !field.isRelationshipField)
            .map((field) => field.databaseField)

        const relationshipFields = resource
            .serialize()
            .fields.filter((field) => field.isRelationshipField)
            .map((field) => field.inputName)

        const parsedQuery = await validateAll(
            {
                perPage,
                page,
                search,
                filters,
                noPagination,
                fields: (fields as string)?.split(','),
                withRelationships: (withRelationships as string)?.split(','),
            },
            {
                perPage: 'number',
                page: 'number',
                fields: 'array',
                search: 'string',
                withRelationships: 'array',
                noPagination: 'string,in:true,false',
                'fields.*': 'in:' + validFields.join(','),
                'withRelationships.*': 'in:' + relationshipFields.join(','),
                filters: 'array',
                'filters.*.field':
                    'required|string|in:' + validFields.join(','),
                'filters.*.value': 'required|string',
                'filters.*.operator':
                    'required|string|in:' + supportedOperators.join(','),
            }
        )

        return parsedQuery
    }

    public async findAll(query = undefined) {
        const resource = this.getCurrentResource()

        const {
            perPage,
            page,
            fields,
            search,
            filters,
            noPagination,
            withRelationships,
        } = await this.validateRequestQuery(query || this.request.query)

        return this.database().findAll({
            perPage: perPage || resource.data.perPageOptions[0] || 10,
            page: page || 1,
            fields,
            search,
            filters,
            noPagination,
            withRelationships,
        })
    }

    public async findAllRelatedResource(
        resourceId: string | number,
        relatedResourceSlugOrResource: string | ResourceContract
    ) {
        const resource = this.getCurrentResource()
        const relatedResource = this.findResource(relatedResourceSlugOrResource)

        const relationField = resource.data.fields.find(
            (field) => field.name === relatedResource.data.name
        )

        const {
            perPage = 10,
            page = 1,
            filters,
            ...rest
        } = await this.validateRequestQuery(this.request.query, relatedResource)

        if (!relationField) {
            throw {
                status: 404,
                message: `Related field not found between ${resource.data.name} and ${relatedResource.data.name}.`,
            }
        }

        if (relationField.component === 'BelongsToManyField') {
            return this.database().findAllBelongingToMany(
                relatedResource,
                resourceId,
                {
                    ...rest,
                    perPage,
                    page,
                    filters,
                }
            )
        }

        if (relationField.component === 'HasManyField') {
            const belongsToField = relatedResource.data.fields.find(
                (field) => field.name === resource.data.name
            )

            if (!belongsToField) {
                throw {
                    status: 404,
                    message: `Related 'belongs to' field not found between ${resource.data.name} and ${relatedResource.data.name}.`,
                }
            }

            return this.database().findAll({
                ...rest,
                perPage,
                page,
                filters: [
                    ...filters,
                    {
                        field: belongsToField.databaseField,
                        value: resourceId,
                        operator: 'equals',
                    },
                ],
            })
        }

        return {}
    }

    public async findOneById(
        id: number | string,
        withRelated?: string[]
    ) {
        const resource = this.getCurrentResource()

        const { fields, withRelationships } = await this.validateRequestQuery(
            this.request.query,
        )

        const model = await this.database().findOneById(
            id,
            fields,
            withRelated ? withRelated : withRelationships
        )

        if (!model) {
            throw {
                message: `Could not find a resource with id ${id}`,
                status: 404,
            }
        }

        return model
    }

    getValidationRules = (creationRules = true) => {
        const fields = this.getCurrentResource().data.fields.filter((field) =>
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
    ) => {
        let validPayload: DataPayload = {}

        this.getCurrentResource().data.fields.forEach((field) => {
            const serializedField = field.serialize()

            if (Object.keys(payload).includes(serializedField.inputName)) {
                validPayload[serializedField.inputName] =
                    payload[serializedField.inputName]
            }
        })

        return validPayload
    }

    breakFieldsIntoRelationshipsAndNonRelationships = (
        payload: DataPayload,
        resource = this.getCurrentResource()
    ) => {
        const relationshipFieldsPayload: DataPayload = {}
        const nonRelationshipFieldsPayload: DataPayload = {}

        resource.data.fields.forEach((field) => {
            const serializedField = field.serialize()

            if (Object.keys(payload).includes(serializedField.inputName)) {
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
        creationRules: boolean = true,
        modelId?: string | number,
        resource = this.getCurrentResource()
    ): Promise<DataPayload> => {
        const {
            relationshipFieldsPayload,
            nonRelationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            this.getResourceFieldsFromPayload(payload),
        )

        const parsedPayload: DataPayload = await validateAll(
            nonRelationshipFieldsPayload,
            this.getValidationRules(creationRules),
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
        return {
            parsedPayload,
            relationshipFieldsPayload,
        }
    }

    validateUniqueFields = async (
        payload: DataPayload,
        resource: ResourceContract,
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

            if (!payload[field.inputName]) {
                return
            }

            if (creationRules) {
                exists = await this.database().findOneByField(
                    field.databaseField,
                    payload[field.inputName],
                    ['id']
                )
            } else {
                exists = await this.database().findOneByFieldExcludingOne(
                    field.databaseField,
                    payload[field.inputName],
                    modelId!,
                    ['id']
                )
            }

            if (exists) {
                console.log('----->>>')
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
        resource = this.getCurrentResource()
    ) => {
        const fields = this.getCurrentResource().data.fields
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

            if (!payload[field.inputName]) {
                return
            }

            if (field.component === 'HasManyField') {
                const allRelatedRows = await this.database().findAllByIds(
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
                    !(await this.database().findOneById(
                        payload[field.inputName],
                        ['id']
                    ))
                ) {
                    throw []
                }
            }
        }
    }

    runAction = async (
        actionSlug: string
    ): Promise<ActionResponse> => {
        const resource = this.getCurrentResource()

        const action = resource.data.actions.find(
            (action) => action.data.slug === actionSlug
        )

        if (!action) {
            throw {
                message: `Action ${actionSlug} is not defined on ${resource.data.slug} resource.`,
                status: 404,
            }
        }

        const models = await this.database().findAllByIds(
            this.request.body.models || []
        )

        const actionResource = createResourceFn(action.name).fields(
            action.data.fields
        )

        const { parsedPayload: payload } = await this.validate(
            this.request.body.form || {},
            undefined,
            undefined,
            actionResource
        )

        const response = await action.data.handler({
            request: this.request,
            models,
            payload,
            html: (html, status = 200) => ({
                html,
                type: 'html',
                status,
            }),
            errors: (errors, status = 200) => ({
                type: 'validation-errors',
                errors,
                status,
            }),
            notification: (notification, status = 200) => ({
                ...notification,
                type: 'notification',
                status,
            }),
            push: (route, status = 200) => ({
                type: 'push',
                status,
                route,
            }),
        })

        return response
    }

    findAllCount = () => {
        return this.database().findAllCount(this.getCurrentResource())
    }

    findOneByField = async (
        databaseField: string,
        value: any
    ) => {
        const resource = this.getCurrentResource()

        const field = this.getFieldFromResource(resource, databaseField)

        if (!field) {
            throw new Error(
                `Field ${databaseField} could not be found on resource.`
            )
        }

        return this.database().findOneByField(
            field.databaseField,
            value
        )
    }
}
