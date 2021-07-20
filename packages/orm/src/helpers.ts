import { ReferenceType } from '@mikro-orm/core'
import { FieldContract, ResourceContract } from '@tensei/common'

export const resolveFieldTypescriptType = (
    field: FieldContract,
    resources: ResourceContract[]
  ) => {
    if (
      ['integer', 'bigInteger', 'int', 'number', 'float', 'double'].includes(
        field.property.type!
      )
    ) {
      return 'number'
    }
  
    if (field.property.type === 'boolean') {
      return 'boolean'
    }
  
    if (field.property.type === 'date') {
      return 'Date'
    }
  
    if (field.property.type === 'json') {
      if (field.validationRules.includes('array')) {
        if (field.arrayValidationRules.includes('string')) {
          return 'string[]'
        }
  
        if (field.arrayValidationRules.includes('number')) {
          return 'number[]'
        }
  
        if (field.arrayValidationRules.includes('decimal')) {
          return 'number[]'
        }
  
        if (field.arrayValidationRules.includes('date')) {
          return 'Date[]'
        }
      }
    }
  
    if (
      field.relatedProperty.reference === ReferenceType.MANY_TO_ONE ||
      field.relatedProperty.reference === ReferenceType.ONE_TO_ONE
    ) {
      const relatedResource = resources.find(
        resource => resource.data.name === field.name
      )
  
      if (relatedResource) {
        return `${relatedResource.data.pascalCaseName}Model`
      }
  
      return 'ID'
    }
  
    if (
      field.relatedProperty.reference === ReferenceType.ONE_TO_MANY ||
      field.relatedProperty.reference === ReferenceType.MANY_TO_MANY
    ) {
      const relatedResource = resources.find(
        resource => resource.data.name === field.name
      )
  
      if (relatedResource) {
        return `${relatedResource.data.pascalCaseName}Model[]`
      }
  
      return 'ID[]'
    }
  
    return 'string'
  }
