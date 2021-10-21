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

  if (!query.page) {
    query.page = 1
  }

  if (!query.perPage) {
    query.perPage = 10
  }

  if (query.page && query.page !== '-1') {
    findOptions.limit =
      parseInt(query.perPage) || resource.data.perPageOptions[0]
    findOptions.offset =
      query.page >= 1 ? (query.page - 1) * findOptions.limit : 0
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

export const parseQueryToWhereOptions = (query: any) => {
  let whereOptions: FilterQuery<any> = {}

  if (query.where) {
    const strigifiedQuery = qs.stringify(
      typeof query.where === 'string' ? JSON.parse(query.where) : query.where,
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
