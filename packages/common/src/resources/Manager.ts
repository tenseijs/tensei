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

export class Manager implements ManagerContract {
    constructor(
        private resources: ResourceContract[],
        private db: DatabaseRepositoryInterface
    ) {}

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
    }

    public async deleteById(
        request: Request,
        resourceSlugOrResource: string | ResourceContract,
        id: number | string
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        await this.db.deleteById(resource, id)
    }

    public async createAdmin(
        request: Request,
        resourceSlugOrResource: string | ResourceContract,
        payload: DataPayload
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const roleResource = this.resources.find(
            (resource) => resource.data.slug === 'administrator-roles'
        )

        if (!roleResource) {
            throw {
                message: `The role resource must be registered.`,
                status: 422,
            }
        }

        const superAdmin = await this.db.findOneByField(
            roleResource,
            'slug',
            'super-admin'
        )

        if (!superAdmin) {
            throw {
                message: `The super-admin role must be setup before creating an administrator user.`,
                status: 422,
            }
        }

        const { id } = await this.create(request, resource, {
            ...payload,
            administrator_roles: [superAdmin.id],
        })

        return id
    }

    public async create(
        request: Request,
        resourceSlugOrResource: string | ResourceContract,
        payload: DataPayload
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        let validatedPayload = await this.validate(payload, resource)

        const {
            nonRelationshipFieldsPayload,
            relationshipFieldsPayload,
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            await resource.hooks.beforeCreate(
                {
                    ...validatedPayload.parsedPayload,
                    ...validatedPayload.relationshipFieldsPayload,
                },
                request
            ),
            resource
        )

        // TODO: Insert beforeCreate hook for fields here.

        const model = await this.db.create(
            resource,
            nonRelationshipFieldsPayload,
            relationshipFieldsPayload
        )

        return model
    }

    public async update(
        request: Request,
        resourceSlugOrResource: string | ResourceContract,
        id: number | string,
        payload: DataPayload,
        patch = true
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        let { parsedPayload, relationshipFieldsPayload } = await this.validate(
            payload,
            resource,
            false,
            id
        )

        parsedPayload = resource.hooks.beforeUpdate(parsedPayload, request)

        // TODO: Add beforeUpdate hook for fields.

        return this.db.update(
            resource,
            id,
            parsedPayload,
            relationshipFieldsPayload,
            patch
        )
    }

    public async updateRelationshipFields(
        resource: ResourceContract,
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
        resource: ResourceContract,
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
            per_page: perPage,
            page,
            fields,
            search,
            filter,
            with: withRelationships,
            no_pagination: noPagination = 'false',
        }: Request['query'],
        resource: ResourceContract
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

    public async findAll(
        request: Request,
        resourceSlugOrResource: string | ResourceContract
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const {
            perPage,
            page,
            fields,
            search,
            filters,
            noPagination,
            withRelationships,
        } = await this.validateRequestQuery(request.query, resource)

        return this.db.findAll(resource, {
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
        request: Request,
        resourceId: string | number,
        resourceSlugOrResource: string | ResourceContract,
        relatedResourceSlugOrResource: string | ResourceContract
    ) {
        const resource = this.findResource(resourceSlugOrResource)
        const relatedResource = this.findResource(relatedResourceSlugOrResource)

        const relationField = resource.data.fields.find(
            (field) => field.name === relatedResource.data.name
        )

        const {
            perPage = 10,
            page = 1,
            filters,
            ...rest
        } = await this.validateRequestQuery(request.query, relatedResource)

        if (!relationField) {
            throw {
                status: 404,
                message: `Related field not found between ${resource.data.name} and ${relatedResource.data.name}.`,
            }
        }

        if (relationField.component === 'BelongsToManyField') {
            return this.db.findAllBelongingToMany(
                resource,
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

            return this.db.findAll(relatedResource, {
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
        request: Request,
        resourceSlugOrResource: string | ResourceContract,
        id: number | string,
        withRelated?: string[]
    ) {
        const resource = this.findResource(resourceSlugOrResource)

        const { fields, withRelationships } = await this.validateRequestQuery(
            request.query,
            resource
        )

        const model = await this.db.findOneById(
            resource,
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

    getValidationRules = (resource: ResourceContract, creationRules = true) => {
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
        resource: ResourceContract
    ) => {
        let validPayload: DataPayload = {}

        resource.data.fields.forEach((field) => {
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
        resource: ResourceContract
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
        resource: ResourceContract,
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
        resource: ResourceContract
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

            if (!payload[field.inputName]) {
                return
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

    runAction = async (
        request: Request,
        resourceSlug: string,
        actionSlug: string
    ): Promise<ActionResponse> => {
        const resource = this.findResource(resourceSlug)

        const action = resource.data.actions.find(
            (action) => action.data.slug === actionSlug
        )

        if (!action) {
            throw {
                message: `Action ${actionSlug} is not defined on ${resourceSlug} resource.`,
                status: 404,
            }
        }

        const models = await this.db.findAllByIds(
            resource,
            request.body.models || []
        )

        const actionResource = createResourceFn(action.name).fields(
            action.data.fields
        )

        const { parsedPayload: payload } = await this.validate(
            request.body.form || {},
            actionResource
        )

        const response = await action.data.handler({
            request,
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

    getAdministratorById = (id: number | string) => {
        return this.db.getAdministratorById(id)
    }

    findUserByEmail = (email: string) => {
        return this.db.findUserByEmail(email)
    }

    getAdministratorsCount = () => this.db.getAdministratorsCount()
}
