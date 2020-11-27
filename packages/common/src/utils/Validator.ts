import * as validator from 'indicative/validator'
import { EntityManager, ReferenceType } from '@mikro-orm/core'
import { DataPayload, ResourceContract } from '@tensei/common'

export class Validator {
    constructor(
        private resource: ResourceContract,
        private manager: EntityManager,
        private resourcesMap: { [key: string]: ResourceContract },
        private modelId?: string | number
    ) {
        let self = this

        validator.extend('unique', {
            async: true,
            async validate(data, field, args) {
                const whereOptions: any = {
                    [args[0]]: data.original[args[0]]
                }

                if (args[1] && self.modelId) {
                    whereOptions.id = {
                        $ne: self.modelId
                    }
                }

                const count = await self.manager.count(
                    self.resource.data.pascalCaseName,
                    whereOptions
                )

                return count === 0
            }
        })
    }

    getValidationRules = (creationRules = true) => {
        const fields = this.resource.data.fields.filter(field =>
            creationRules
                ? field.showHideField.showOnCreation
                : field.showHideField.showOnUpdate
        )

        const rules: {
            [key: string]: string
        } = {}

        fields.forEach(field => {
            const fieldValidationRules = Array.from(
                new Set([
                    ...field.validationRules,
                    ...field[
                        creationRules
                            ? 'creationValidationRules'
                            : 'updateValidationRules'
                    ]
                ])
            ).join('|')

            if (field.relatedProperty.reference) {
                const relatedResource = this.resourcesMap[
                    field.relatedProperty.type!
                ]

                const primaryFieldType =
                    relatedResource.getPrimaryField()!.property.type ===
                    'number'
                        ? 'number'
                        : 'string'

                if (
                    [
                        ReferenceType.MANY_TO_MANY,
                        ReferenceType.ONE_TO_MANY
                    ].includes(field.relatedProperty.reference!)
                ) {
                    rules[field.databaseField] = 'array'
                    rules[`${field.databaseField}.*`] = primaryFieldType
                } else {
                    rules[field.databaseField] = primaryFieldType
                }
            }

            if (fieldValidationRules) {
                rules[field.databaseField] = fieldValidationRules
            }
        })

        return rules
    }

    getResourceFieldsFromPayload = (payload: DataPayload) => {
        let validPayload: DataPayload = {}

        this.resource.data.fields.forEach(field => {
            if (Object.keys(payload).includes(field.databaseField)) {
                validPayload[field.databaseField] = payload[field.databaseField]
            }
        })

        return validPayload
    }

    breakFieldsIntoRelationshipsAndNonRelationships = (
        payload: DataPayload
    ) => {
        const relationshipFieldsPayload: DataPayload = {}
        const nonRelationshipFieldsPayload: DataPayload = {}

        this.resource.data.fields.forEach(field => {
            if (Object.keys(payload).includes(field.databaseField)) {
                if (field.relatedProperty.reference) {
                    relationshipFieldsPayload[field.databaseField] =
                        payload[field.databaseField]
                } else {
                    nonRelationshipFieldsPayload[field.databaseField] =
                        payload[field.databaseField]
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
        modelId?: string | number
    ): Promise<DataPayload> => {
        try {
            const parsedPayload: DataPayload = await validator.validateAll(
                this.getResourceFieldsFromPayload(payload),
                this.getValidationRules(creationRules),
                this.resource.data.validationMessages
            )

            return [true, parsedPayload]
        } catch (errors) {
            return [false, errors]
        }
    }
}
