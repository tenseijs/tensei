import qs from 'qs'
import { ResourceContract, Utils } from '@tensei/common'
import { FindOptions, FilterQuery } from '@mikro-orm/core'

export const parseSortFromStringToObject = (
    path: string,
    direction: string
) => {
    let obj: any = {}

    path.split('.').reduce((obj, key, index) => {
        if (index === path.split('.').length - 1) {
            return (obj[key] = obj[key] || direction)
        }

        return (obj[key] = obj[key] || {})
    }, obj)

    return obj
}

export const parseQueryToFindOptions = (
    query: any,
    resource: ResourceContract
) => {
    let findOptions: FindOptions<any> = {}

    if (query.page && query.page !== '-1') {
        findOptions.limit =
            parseInt(query.per_page) || resource.data.perPageOptions[0]
        findOptions.offset =
            query.page >= 1 ? (query.page - 1) * findOptions.limit : 0
    }

    if (query.deep_populate) {
        const strigifiedQuery = qs.stringify(query.deep_populate, {
            encode: false
        })
        const parsedQuery = qs.parse(strigifiedQuery, {
            arrayLimit: 100,
            depth: 20
        })

        findOptions.populate = parsedQuery as any
    }

    if (query.populate) {
        findOptions.populate = query.populate.split(',')
    }

    if (query.fields) {
        findOptions.fields = query.fields.split(',')
    }

    if (query.filters) {
        findOptions.filters = query.filters
    }

    if (query.sort) {
        const sorters = query.sort
            .split(',')
            .map((sorter: string) => sorter.split(':')) as string[]

        sorters.forEach(([field, direction]) => {
            findOptions.orderBy = field.includes('.')
                ? {
                    ...findOptions.orderBy,
                    ...parseSortFromStringToObject(field, direction)
                }
                : {
                    ...findOptions.orderBy,
                    [field]: direction
                }
        })
    }

    return findOptions
}

export const getFindOptionsPopulate = (findOptions: FindOptions<any>) => {
    if (
        findOptions.populate &&
        Array.isArray(findOptions.populate) &&
        findOptions.populate.length > 0 &&
        findOptions.populate.every(option => typeof option === 'string')
    ) {
        return findOptions.populate
    }

    return []
}

export const parseQueryToWhereOptions = (query: any) => {
    let whereOptions: FilterQuery<any> = {}

    if (query.where) {
        const strigifiedQuery = qs.stringify(
            typeof query.where === 'string'
                ? JSON.parse(query.where)
                : query.where,
            { encode: false }
        )
        const parsedQuery = qs.parse(strigifiedQuery, {
            decoder(value) {
                if (/^(\d+|\d*\.\d+)$/.test(value)) {
                    return parseFloat(value)
                }

                value = value.replace(/where/, '')

                let keywords: any = {
                    true: true,
                    false: false,
                    null: null,
                    undefined: undefined
                }
                if (value in keywords) {
                    return keywords[value]
                }

                return value
            }
        })
        whereOptions = parsedQuery
    }

    return Utils.graphql.parseWhereArgumentsToWhereQuery(whereOptions)
}

export const getGraphQlInfoObject = (
    findOptions: any,
    resources: ResourceContract[],
    resource: ResourceContract
) => {
    const populateValues = Object.values(
        (findOptions.populate as any) || {}
    ).map(item => Object.values(item as any))[0]

    return {
        ...transformToInfoObject(resources, populateValues || []),
        ...getModelFields(resources, resource.data.snakeCaseNamePlural)
    }
}

export const transformToInfoObject = (resources: any, data: any) => {
    const res = data.reduce((acc: any, currVal: any) => {
        const fields = getModelFields(resources, currVal.relation)

        let args = {}
        if (currVal.limit) {
            args = {
                ...args,
                limit: currVal.limit
            }
        }

        if (currVal.offset) {
            args = {
                ...args,
                offset: currVal.offset
            }
        }

        acc = {
            ...acc,
            [currVal.relation]: {
                name: currVal.relation,
                alias: currVal.relation,
                args: {
                    ...args
                },
                fieldsByTypeName: {
                    ...fields
                }
            }
        }

        if (currVal.deep_populate) {
            acc[currVal.relation] = {
                ...acc[currVal.relation],
                fieldsByTypeName: {
                    [currVal.relation]: {
                        ...transformToInfoObject(resources, currVal.deep_populate)
                    }
                }
            }
        }
        return acc
    }, {})
    return res
}

export const getModelFields = (
    resources: ResourceContract[],
    modelName: any
) => {
    const fields = resources.find(resource => {
        return resource.data.slugPlural === modelName
    })?.data.fields

    const result = fields
        ?.filter(field => !field.relatedProperty.reference)
        ?.reduce((acc: any, currVal: any) => {
            acc = {
                ...acc,
                [currVal.databaseField]: {
                    name: currVal.databaseField,
                    alias: currVal.databaseField,
                    args: {},
                    fieldsByTypeName: {}
                }
            }
            return acc
        }, {})
    return result
}
