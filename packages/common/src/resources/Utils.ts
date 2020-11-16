import { Request } from 'express'
import { validateAll } from 'indicative/validator'
import { resource as createResourceFn } from './Resource'
import { DataPayload, FetchAllRequestQuery, Filter } from '@tensei/common'
import {
    ActionResponse,
    ManagerContract,
    ResourceContract,
    DatabaseRepositoryInterface
} from '@tensei/common'
import { ResourceHelpers } from '../helpers'

export class Utils extends ResourceHelpers {
    constructor(
        private request: Request | null,
        resources: ResourceContract[],
        public repository: DatabaseRepositoryInterface,
    ) {
        super(resources)
    }

    public database = (resource = this.getCurrentResource()) => {
        return this.request?.manager.getRepository(resource.data.pascalCaseName)
    }

    // @ts-ignore
    public async authorize(
        authorizeFn: keyof ResourceContract['dashboardAuthorizeCallbacks'],
        models?: any[],
        resource = this.getCurrentResource()
    ) {
        const authorizeFunctions = this.request?.originatedFromDashboard
            ? resource.dashboardAuthorizeCallbacks[authorizeFn]
            : resource.authorizeCallbacks[authorizeFn]

        const authorizedResults = await Promise.all(
            authorizeFunctions.map(fn => fn(this.request!, models))
        )

        if (
            authorizedResults.filter(authorized => authorized === true)
                .length !== authorizedResults.length
        ) {
            throw {
                status: 401,
                message: `You are not authorized to perform this action.`
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
            no_pagination: noPagination = 'false'
        }: Request['query'],
        resource = this.getCurrentResource()
    ) {
        let filters: Filter[] = []

        if (typeof filter === 'object') {
            Object.keys(filter || {}).forEach(filterKey => {
                const [field, operator] = filterKey.split(':')

                filters.push({
                    field,
                    operator: (operator as any) || 'equals',
                    value: ((filter || {}) as any)[filterKey]
                })
            })
        }

        const supportedOperators: Filter['operator'][] = [
            'equals',
            'contains',
            'not_equals',
            'is_null',
            'not_null',
            'gt',
            'gte',
            'lt',
            'lte',
            'matches'
        ]

        const validFields = resource
            .serialize()
            .fields.filter(field => !field.isRelationshipField)
            .map(field => field.databaseField)

        const relationshipFields = resource
            .serialize()
            .fields.filter(field => field.isRelationshipField)
            .map(field => field.inputName)

        return validateAll(
            {
                perPage,
                page,
                search,
                filters,
                noPagination,
                fields: (fields as string)?.split(','),
                withRelationships: (withRelationships as string)?.split(',')
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
                    'required|string|in:' + supportedOperators.join(',')
            }
        )
    }

    getValidationRules = (
        creationRules = true,
        resource = this.getCurrentResource()
    ) => {
        const fields = resource.data.fields.filter(field =>
            creationRules
                ? field.showHideField.showOnCreation
                : field.showHideField.showOnUpdate
        )

        const rules: {
            [key: string]: string
        } = {}

        fields.forEach(field => {
            const serializedField = field.serialize()

            const fieldValidationRules = Array.from(
                new Set([
                    ...serializedField.rules,
                    ...serializedField[
                    creationRules ? 'creationRules' : 'updateRules'
                    ]
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
        resource = this.getCurrentResource()
    ) => {
        let validPayload: DataPayload = {}

        resource.data.fields.forEach(field => {
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

        resource.data.fields.forEach(field => {
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
            nonRelationshipFieldsPayload
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
            nonRelationshipFieldsPayload
        } = this.breakFieldsIntoRelationshipsAndNonRelationships(
            this.getResourceFieldsFromPayload(payload, resource),
            resource
        )

        const parsedPayload: DataPayload = await validateAll(
            nonRelationshipFieldsPayload,
            this.getValidationRules(creationRules, resource),
            resource.data.validationMessages
        )

        await this.validateRelationshipFields(
            relationshipFieldsPayload,
            resource
        )

        await this.validateUniqueFields(
            nonRelationshipFieldsPayload,
            creationRules,
            modelId,
            resource
        )

        // then we need to validate all unique fields.
        return {
            parsedPayload,
            relationshipFieldsPayload
        }
    }

    validateRelationshipFields = async (
        payload: DataPayload,
        resource = this.getCurrentResource()
    ) => {
        const fields = resource.data.fields
            .map(field => field.serialize())
            .filter(
                field =>
                    field.isRelationshipField ||
                    field.component === 'BelongsToField'
            )

        for (let index = 0; index < fields.length; index++) {
            const field = fields[index]
            const relatedResource = this.resources.find(
                relatedResource => relatedResource.data.name === field.name
            )

            if (!relatedResource) {
                throw [
                    {
                        message: `The related resource ${field.name} could not be found.`,
                        field: field.inputName
                    }
                ]
            }

            if (
                ['HasManyField', 'BelongsToManyField'].includes(field.component)
            ) {
                payload[field.inputName] = payload[field.inputName] || []
            }

            if (
                field.component === 'HasManyField' &&
                payload[field.inputName] &&
                payload[field.inputName].length > 0
            ) {
                const allRelatedRows = await this.database()?.findAll({ filters: { id: payload[field.inputName] }, populate: [relatedResource] as any })

                if (allRelatedRows?.length !== payload[field.inputName].length) {
                    throw [
                        {
                            message: `Invalid values were provided for the related resource. Make sure all values provided exist in the database table ${relatedResource.data.table}`,
                            field: field.inputName
                        }
                    ]
                }
            }

            //the code might never get here, because for it to get here the field must be a relationship component and BelongsToField is not a relationship component

            if (
                field.component === 'BelongsToField' &&
                payload[field.inputName]
            ) {
                if (
                    !(await this.database()?.findOne(payload[field.inputName]))
                ) {
                    throw []
                }
            }
        }
    }

    validateUniqueFields = async (
        payload: DataPayload,
        creationRules = true,
        modelId?: string | number,
        resource = this.getCurrentResource()
    ) => {
        const uniqueFields = resource
            .serialize()
            .fields.filter(
                field => field.isUnique && !field.isRelationshipField
            )

        for (let index = 0; index < uniqueFields.length; index++) {
            const field = uniqueFields[index]

            let exists: null | {} = null

            if (!payload[field.inputName]) {
                return
            }

            if (creationRules) {
                exists = await this.database()?.findOne({ [field.databaseField]: payload[field.inputName] }) as any
            } else {
                exists = await this.database()?.findOne({ [field.databaseField]: { $eq: payload[field.inputName], id: { $ne: modelId! } } }) as any
            }

            if (exists) {
                throw [
                    {
                        message: `A ${resource.data.name.toLowerCase()} already exists with ${field.inputName
                            } ${payload[field.inputName]}.`,
                        field: field.inputName
                    }
                ]
            }
        }
    }

}
