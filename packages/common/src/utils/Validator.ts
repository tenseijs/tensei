import * as validator from 'indicative/validator'
import * as sanitizer from 'indicative/sanitizer'
import { EntityManager, ReferenceType } from '@mikro-orm/core'
import { DataPayload, ResourceContract } from '@tensei/common'

export class Validator {
  private expressRequest?: Express.Request = undefined

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
        if (!data.original[args[0]]) {
          return true
        }

        const whereOptions: any = {
          [args[0]]: data.original[args[0]]
        }

        if (self.modelId) {
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

  getSanitizationRules = () => {
    const fields = this.resource.data.fields.filter(
      field =>
        field.showHideField.showOnCreation || field.showHideField.showOnUpdate
    )

    const rules: {
      [key: string]: string
    } = {}

    fields.forEach(field => {
      if (field.sanitizeRule) {
        rules[field.databaseField] = field.sanitizeRule
      }
    })

    return rules
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
            creationRules ? 'creationValidationRules' : 'updateValidationRules'
          ]
        ])
      ).join('|')

      if (field.relatedProperty.reference) {
        const relatedResource = this.resourcesMap[field.relatedProperty.type!]

        const primaryFieldType =
          relatedResource.getPrimaryField()!.property.type === 'number'
            ? 'number'
            : 'string'

        if (
          [ReferenceType.MANY_TO_MANY, ReferenceType.ONE_TO_MANY].includes(
            field.relatedProperty.reference!
          )
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

      // Add the validation rules for any array fields.
      if (field.arrayValidationRules.length > 0) {
        rules[`${field.databaseField}.*`] = field.arrayValidationRules.join('|')
      }
    })

    return rules
  }

  getResourceFieldsFromPayload = (payload: DataPayload) => {
    let validPayload: DataPayload = {}

    this.resource.data.fields.forEach(field => {
      if (Object.keys(payload).includes(field.databaseField)) {
        const value = field.getValueFromPayload(payload, this.expressRequest!)
        if (!['', undefined].includes(value)) {
          validPayload[field.databaseField] = value
        }
      }
    })

    return validPayload
  }

  breakFieldsIntoRelationshipsAndNonRelationships = (payload: DataPayload) => {
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

  request(request: Express.Request) {
    this.expressRequest = request

    return this
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

      return [
        true,
        await sanitizer.sanitize(parsedPayload, this.getSanitizationRules())
      ]
    } catch (errors) {
      return [false, errors]
    }
  }
}
