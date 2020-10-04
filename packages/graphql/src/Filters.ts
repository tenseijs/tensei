import { ResourceContract } from '@tensei/common'
import { GraphQLEnumValueConfigMap, GraphQLEnumType } from 'graphql'

export const FilterGraphqlTypes = new class Filter {

    getFieldsTypeDefinition(resource: ResourceContract) {
        return resource.data.fields.filter(field => !field.isHidden && !field.serialize().isRelationshipField).map(field => {
            return `
  ${field.databaseField}`
        })
    }

    public getQueryFilterOperatorType(resource: ResourceContract) {
        const validOperators = [
            'equals',
            'contains',
            'not_equals',
            'is_null',
            'not_null',
            'gt',
            'gte',
            'lt',
            'lte',
            'matches',
            'in',
            'not_in'
        ]

        const FilterOperatorValueTypes: GraphQLEnumValueConfigMap = {}

        validOperators.forEach(operator => {
            FilterOperatorValueTypes[operator] = {
                [operator]: {
                    description: `Filter operator ${operator} for ${resource.data.camelCaseNamePlural}.`,
                    value: operator
                }
            }
        })

        const FilterOperatorType = new GraphQLEnumType({
            name: `${resource.data.pascalCaseName}FilterOperator`,
            values: FilterOperatorValueTypes
        })

        return FilterOperatorType
    }

    public getEnumTypeOfResourceFields(resource: ResourceContract) {
        const values: GraphQLEnumValueConfigMap = {}

        resource.data.fields.forEach(field => {

            if (field.serialize().isRelationshipField) {
                return
            }

            values[field.databaseField] = {
                value: field.databaseField,
            }
        })

        return new GraphQLEnumType({
            name: `${resource.data.pascalCaseName}Fields`,
            values
        })
    }

}
