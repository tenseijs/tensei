import { FilterQuery, FindOptions } from '@mikro-orm/core'
import { ResourceContract } from '@tensei/common'
import qs from 'qs'

class BaseController {
    public getPageMetaFromFindOptions(total: number, findOptions: FindOptions<any>) {
        return {
            total,
            page:
                findOptions.offset ||
                    (findOptions.offset === 0 && findOptions.limit)
                    ? Math.ceil(
                        (findOptions.offset + 1) / findOptions.limit!
                    )
                    : null,
            perPage: findOptions.limit ? findOptions.limit : null,
            pageCount: Math.ceil(total / findOptions.limit!)
        }
    }

    public parseQueryToFindOptions(query: any, resource: ResourceContract) {
        let findOptions: FindOptions<any> = {}

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
            const sorters = query.sort.split(',').map((sorter: string) => sorter.split(':')) as string[]

            sorters.forEach(([field, direction]) => {
                findOptions.orderBy = {
                    ...findOptions.orderBy,
                    [field]: direction as any
                }
            })
        }
        return findOptions
    }

    public parseQueryToWhereOptions(query: any) {
        let whereOptions: FilterQuery<any> = {}

        if (query.where) {
            const strigifiedQuery = qs.stringify(query.where, { encode: false })
            const parsedQuery = qs.parse(strigifiedQuery, {
                decoder(value) {
                    if (/^(\d+|\d*\.\d+)$/.test(value)) {
                        return parseFloat(value);
                    }

                    value = value.replace(/where/, '')

                    let keywords: any = {
                        true: true,
                        false: false,
                        null: null,
                        undefined: undefined,
                    };
                    if (value in keywords) {
                        return keywords[value];
                    }

                    return value;
                }
            });
            whereOptions = parsedQuery
        }

        return whereOptions
    }
}

export default BaseController
