import { ResourceHelpers } from '../helpers'
import { DataPayload } from '@tensei/core'
import { EntityManager } from '@mikro-orm/core'
import { validateAll } from 'indicative/validator'
import { ResourceContract } from '@tensei/common'

export class Util extends ResourceHelpers {
    constructor(
        public resources: ResourceContract[],
        private em: EntityManager
    ) {
        super(resources)
    }

    validate = async (
        resource = this.getCurrentResource(),
        payload: DataPayload,
        creationRules: boolean = true,
        modelId?: string | number
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

        // then we need to validate all unique fields.
        return {
            parsedPayload,
            relationshipFieldsPayload
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
                // exists = await this.database().findOneByField(
                //     field.databaseField,
                //     payload[field.inputName],
                //     ['id']
                // )
            } else {
                // exists = await this.database().findOneByFieldExcludingOne(
                //     field.databaseField,
                //     payload[field.inputName],
                //     modelId!,
                //     ['id']
                // )
            }

            if (exists) {
                throw [
                    {
                        message: `A ${resource.data.name.toLowerCase()} already exists with ${
                            field.inputName
                        } ${payload[field.inputName]}.`,
                        field: field.inputName
                    }
                ]
            }
        }
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

    public async authorize(
        ctx: any,
        resource = this.getCurrentResource(),
        authorizeFn: keyof ResourceContract['dashboardAuthorizeCallbacks'],
        models?: any[]
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
}
