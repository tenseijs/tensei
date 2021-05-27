import { ReferenceType } from '@mikro-orm/core'
import { ResourceContract, FieldContract, FilterOperators } from '@tensei/common'

export const filterOperators: FilterOperators[] = [
    '_eq',
    '_ne',
    '_in',
    '_nin',
    '_gt',
    '_gte',
    '_lt',
    '_lte',
    '_like',
    '_re',
    '_ilike',
    '_overlap',
    '_contains',
    '_contained'
]

export const topLevelOperators: FilterOperators[] = ['_and', '_or', '_not']

export const allOperators = filterOperators.concat(topLevelOperators)

const resolveFieldTypescriptType = (field: FieldContract, resources: ResourceContract[]) => {
	if (
		['integer', 'bigInteger', 'int', 'number', 'float', 'double'].includes(field.property.type!)
	) {
		return 'number'
	}

	if (field.property.type === 'boolean') {
		return 'boolean'
	}

	if (field.property.type === 'date') {
		return 'DateString'
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
                return 'DateString[]'
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
            return `${relatedResource.data.pascalCaseName}`
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
            return `${relatedResource.data.pascalCaseName}`
        }

        return 'ID[]'
    }

	return 'string'
}

const getBaseTypes = () => {
	return `
export type DateString = string
export type Decimal = number
export type ID = number
`
}

const getStaticWhereQueryInterfaces = () => {
    return `
    export interface StringWhereQueryInput {
        ${filterOperators.map(operator => {
            if (['_in', '_nin'].includes(operator)) {
                return `${operator}: string[]`
            }
    
            return `${operator}: string`
        })}
    }

    export interface NumberWhereQueryInput {
        ${filterOperators.map(operator => {
            if (['_in', '_nin'].includes(operator)) {
                return `${operator}: number[]`
            }
    
            return `${operator}: number`
        })}
    }

    export interface IDWhereQueryInput {
        ${filterOperators.map(operator => {
            if (['_in', '_nin'].includes(operator)) {
                return `${operator}: ID[]`
            }
    
            return `${operator}: ID`
        })}
    }

    export interface DateWhereQueryInput {
        ${filterOperators.map(operator => {
            if (['_in', '_nin'].includes(operator)) {
                return `${operator}: DateString[]`
            }
    
            return `${operator}: DateString`
        })}
    }
    `
}

const getFieldWhereQueryInputTypes = (field: FieldContract, resources: ResourceContract[]) => {
    if (field.property.type === 'boolean') {
        // return 'boolean_where_query'
    }

    if (field.property.type === 'date') {
        return 'DateWhereQueryInput'
    }

    if (
        [
            ReferenceType.MANY_TO_MANY,
            ReferenceType.ONE_TO_MANY,
            ReferenceType.MANY_TO_ONE,
            ReferenceType.ONE_TO_ONE
        ].includes(field.relatedProperty.reference!)
    ) {
        const relatedResource = resources.find(
            resource =>
                resource.data.pascalCaseName === field.relatedProperty.type
        )

        return `${relatedResource?.data.pascalCaseName}WhereQueryInput`
    }

    if (field.property.primary) {
        return `IDWhereQueryInput`
    }

    if (field.property.type === 'integer') {
        return 'NumberWhereQueryInput'
    }

    return 'StringWhereQueryInput'
}

const getWhereQueryResourceInterface = (resource: ResourceContract, resources: ResourceContract[]) => {
    const interfaceName = `${resource.data.pascalCaseName}WhereQueryInput`

    return `
        export interface ${resource.data.pascalCaseName}WhereQueryInput {
            ${topLevelOperators.map(operator => `${operator}: ${operator === '_not' ? interfaceName : `${interfaceName}[]`}`)},
            ${resource
                .getFetchApiExposedFields()
                .filter(field => field.isFilterable)
                .map(
                    field =>
                        `${field.databaseField}: ${getFieldWhereQueryInputTypes(field, resources)}`
                )}
        }
    `
}

const getInsertResourceInterface = (resource: ResourceContract, resources: ResourceContract[]) => {
	if (resource.data.hideOnInsertApi) {
		return ''
	}

	return `
        export interface ${resource.data.pascalCaseName}InsertInput {
            ${resource.data.fields
							.filter(
								(field) =>
									!field.property.primary &&
									!field.property.hidden &&
									!field.showHideFieldFromApi.hideOnInsertApi
							)
							.map((field) => `${field.databaseField}${(field.validationRules.includes('required')) ? '' : '?'}: ${resolveFieldTypescriptType(field, resources)}`)}
        }
    `
}

export const generateResourceInterfaces = async (resources: ResourceContract[]) => {
	return resources
		.map((resource) => {
			return `
            /**
             * 
             * Type definitions for the ${resource.data.name} resource.
             * 
             **/
            export interface ${resource.data.pascalCaseName} {
                ${resource.data.fields.map((field) => {
                                return `${field.databaseField}: ${resolveFieldTypescriptType(field, resources)}`
                            })}
        }
        ${getWhereQueryResourceInterface(resource, resources)}
        ${getInsertResourceInterface(resource, resources)}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
`
		})
		.concat([getBaseTypes(), getStaticWhereQueryInterfaces()])
		.join('')
}
