import { ReferenceType } from '@mikro-orm/core'
import { ResourceContract, FieldContract, FilterOperators, PluginSetupConfig } from '@tensei/common'

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
	'_contained',
]

export const topLevelOperators: FilterOperators[] = ['_and', '_or', '_not']

export const allOperators = filterOperators.concat(topLevelOperators)

export const resolveFieldTypescriptType = (
	field: FieldContract,
	resources: ResourceContract[],
) => {
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
		const relatedResource = resources.find((resource) => resource.data.name === field.name)

		if (relatedResource) {
			return `${relatedResource.data.pascalCaseName}['id']`
		}

		return 'ID'
	}

	if (
		field.relatedProperty.reference === ReferenceType.ONE_TO_MANY ||
		field.relatedProperty.reference === ReferenceType.MANY_TO_MANY
	) {
		const relatedResource = resources.find((resource) => resource.data.name === field.name)

		if (relatedResource) {
			return `${relatedResource.data.pascalCaseName}['id'][]`
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
export enum SortQueryInput {
    ASC = 'asc',
    ASC_NULLS_LAST = 'asc_nulls_last',
    ASC_NULLS_FIRST = 'asc_nulls_first',
    DESC = 'desc',
    DESC_NULLS_LAST = 'desc_nulls_last',
    DESC_NULLS_FIRST = 'desc_nulls_first',
}
export interface PaginationOptions {
	page: number
	per_page: number
}

export interface FindResponse<Resource> {
	data: Resource
}

export interface PaginatedResponse<Resource> {
	data: Resource[]
	meta: {
		total: number
		page: number
		per_page: number
		page_count: number
    }
}
`
}

const getRelationshipFieldsForRelatedResource = (relatedResource: ResourceContract) => {
	return relatedResource.data.fields.filter(
		(field) =>
			!field.showHideFieldFromApi.hideOnFetchApi && !field.isHidden && field.isRelationshipField
	)
}

const getResourcePopulateFields = (resource: ResourceContract, resources: ResourceContract[]) => {
	if (resource.data.hideOnFetchApi) {
		return ``
	}

	let possiblePopulates: string[] = []

	getRelationshipFieldsForRelatedResource(resource).forEach((field) => {
		possiblePopulates = [...possiblePopulates, field.relatedProperty.name!]

		const relatedResource = resources.find(
			(resource) => resource.data.pascalCaseName === field.relatedProperty.type
		)

		if (relatedResource) {
			const nestedPopulates = getRelationshipFieldsForRelatedResource(relatedResource).map(
				(nestedField) => `${field.relatedProperty.name}.${nestedField.relatedProperty.name}`
			)

			possiblePopulates = [...possiblePopulates, ...nestedPopulates]
		}

		return possiblePopulates
	})

	return `
	export type ${resource.data.pascalCaseName}PopulateFields = ${possiblePopulates
		.map((field) => `'${field}'`)
		.join('|')}
	`
}

const getResourceFieldsSelectList = (resource: ResourceContract) => {
	if (resource.data.hideOnFetchApi) {
		return ``
	}

	return `export type ${resource.data.pascalCaseName}SelectFields = ${resource.data.fields
		.filter((field) => !field.showHideFieldFromApi.hideOnFetchApi && !field.isHidden)
		.map((field) => `'${field.databaseField}'`)
		.join('|')}`
}

const getStaticWhereQueryInterfaces = () => {
	return `
    export interface StringWhereQueryInput {
        ${filterOperators.map((operator) => {
					if (['_in', '_nin'].includes(operator)) {
						return `${operator}?: string[]`
					}

					return `${operator}?: string`
				})}
    }

    export interface NumberWhereQueryInput {
        ${filterOperators.map((operator) => {
					if (['_in', '_nin'].includes(operator)) {
						return `${operator}?: number[]`
					}

					return `${operator}?: number`
				})}
    }

    export interface IDWhereQueryInput {
        ${filterOperators.map((operator) => {
					if (['_in', '_nin'].includes(operator)) {
						return `${operator}?: ID[]`
					}

					return `${operator}?: ID`
				})}
    }

    export interface DateWhereQueryInput {
        ${filterOperators.map((operator) => {
					if (['_in', '_nin'].includes(operator)) {
						return `${operator}?: DateString[]`
					}

					return `${operator}?: DateString`
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
			ReferenceType.ONE_TO_ONE,
		].includes(field.relatedProperty.reference!)
	) {
		const relatedResource = resources.find(
			(resource) => resource.data.pascalCaseName === field.relatedProperty.type
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

const getWhereQueryResourceInterface = (
	resource: ResourceContract,
	resources: ResourceContract[]
) => {
	const interfaceName = `${resource.data.pascalCaseName}WhereQueryInput`

	return `
        export interface ${resource.data.pascalCaseName}WhereQueryInput {
            ${topLevelOperators.map(
							(operator) =>
								`${operator}?: ${operator === '_not' ? interfaceName : `${interfaceName}[]`}`
						)},
            ${resource
							.getFetchApiExposedFields()
							.filter((field) => field.isFilterable)
							.map(
								(field) =>
									`${field.databaseField}?: ${getFieldWhereQueryInputTypes(field, resources)}`
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
							.map(
								(field) =>
									`${field.databaseField}${
										field.validationRules.includes('required') ? '' : '?'
									}: ${resolveFieldTypescriptType(field, resources)}`
							)}
        }
    `
}

const getUpdateResourceInterface = (resource: ResourceContract, resources: ResourceContract[]) => {
	if (resource.data.hideOnUpdateApi) {
		return ''
	}

	return `
        export interface ${resource.data.pascalCaseName}UpdateInput {
            ${resource.data.fields
							.filter(
								(field) =>
									!field.property.primary &&
									!field.property.hidden &&
									!field.showHideFieldFromApi.hideOnUpdateApi
							)
							.map(
								(field) =>
									`${field.databaseField}${
										field.validationRules.includes('required') ? '' : '?'
									}: ${resolveFieldTypescriptType(field, resources)}`
							)}
        }
    `
}

const getResourceSortOrder = (resource: ResourceContract) => {
	const interfaceName = `${resource.data.pascalCaseName}SortQueryInput`

	return `
        export interface ${interfaceName} {
            ${resource
							.getFetchApiExposedFields()
							.filter((field) => field.isSortable)
							.map((field) => `${field.databaseField}: SortQueryInput`)}
        }
    `
}

const getResourceInterface = (resource: ResourceContract, resources: ResourceContract[]) => {
	return `
            /**
             * 
             * Type definitions for the ${resource.data.name} resource.
             * 
             **/
            export interface ${resource.data.pascalCaseName} {
                ${resource.data.fields.map(
									(field) =>
										`${field.databaseField}: ${resolveFieldTypescriptType(field, resources)}`
								)}
        }
    `
}

export const generateResourceInterfaces = async ({ resources }: PluginSetupConfig) => {
	return `
    ${resources
			.map(
				(resource) => `
			${getResourcePopulateFields(resource, resources)}
			${getResourceFieldsSelectList(resource)}
            ${getResourceInterface(resource, resources)}
            ${getWhereQueryResourceInterface(resource, resources)}
            ${getInsertResourceInterface(resource, resources)}
            ${getUpdateResourceInterface(resource, resources)}
            ${getResourceSortOrder(resource)}
        `
			)
			.concat([getBaseTypes(), getStaticWhereQueryInterfaces()])
			.join('')}
    `
}
