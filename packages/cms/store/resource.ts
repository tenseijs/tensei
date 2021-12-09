import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  ResourceContract,
  FieldContract,
  AbstractData
} from '@tensei/components'
import { AxiosError, AxiosResponse } from 'axios'

export interface ActiveFilter {
  field: FieldContract
  value: any
  clause: FilterClause
}

export interface FilterClause {
  shortName: string
  name: string
  type?: ('string' | 'number' | 'array')[]
}

export const filterClauses: FilterClause[] = [
  {
    name: 'Is exactly',
    shortName: '_eq',
    type: ['string', 'number']
  },
  {
    name: 'Is not exactly',
    shortName: '_neq',
    type: ['string', 'number']
  },
  {
    name: 'Is greater than',
    shortName: '_gt',
    type: ['number']
  },
  {
    name: 'Is less than',
    shortName: '_lt',
    type: ['number']
  },
  {
    name: 'Is greater than or equal to',
    shortName: '_gte',
    type: ['number']
  },
  {
    name: 'Is less than or equal to',
    shortName: '_lte',
    type: ['number']
  },
  {
    name: 'Is one of',
    shortName: '_in',
    type: ['array']
  },
  {
    name: 'Is not one of',
    shortName: '_nin',
    type: ['array']
  }
]

interface ResourceState extends State {
  resource?: ResourceContract
}
interface TableDataParams {
  perPage?: number
  page?: number
  sort?: string
  sortField: string
  search?: string
  filters?: ActiveFilter[]
}
interface ResourceMethods extends State {
  createResource: (
    resource: ResourceContract,
    resourceInput: AbstractData
  ) => Promise<[AxiosResponse | null, AxiosError | null]>

  updateResource: (
    resource: ResourceContract,
    resourceId: string,
    resourceInput: AbstractData
  ) => Promise<[AxiosResponse | null, AxiosError | null]>

  fetchResourceData: (
    resource: ResourceContract,
    resourceId: string
  ) => Promise<[AxiosResponse | null, AxiosError | null]>

  findResource: (slug: string) => ResourceContract

  fetchTableData: (
    resource: ResourceContract,
    params: TableDataParams
  ) => Promise<[AxiosResponse | null, Error | null]>

  deleteTableData: (
    resource: ResourceContract,
    id: string[]
  ) => Promise<[AxiosResponse | null, Error | null]>
}

export const useResourceStore = create<ResourceState & ResourceMethods>(
  devtools((set, get) => ({
    async createResource(
      resource: ResourceContract,
      resourceInput: AbstractData
    ) {
      return await window.Tensei.api.post(resource?.slugPlural!, resourceInput)
    },

    async updateResource(
      resource: ResourceContract,
      resourceId: string,
      resourceInput: AbstractData
    ) {
      return window.Tensei.api.patch(
        `${resource?.slugPlural!}/${resourceId}`,
        resourceInput
      )
    },

    findResource(slug: string) {
      const resource = window.Tensei.state.resources?.find(
        resource => resource.slug === slug
      )!

      if (resource) {
        set({
          resource
        })
      }

      return resource
    },

    fetchResourceData(resource: ResourceContract, resourceId: string) {
      return window.Tensei.api.get(`/${resource?.slug}/${resourceId}`)
    },

    async fetchTableData(resource: ResourceContract, params: TableDataParams) {
      const { page, perPage, sort, sortField, search, filters } = params

      return window.Tensei.api.get(`/${resource?.slug}`, {
        params: {
          page,
          perPage,
          ...(sortField && { sort }),
          ...(search && { search }),
          ...(filters?.length && {
            where: {
              _and: [
                ...filters.map(item => ({
                  [item.field.databaseField]: {
                    [item.clause.shortName]: item.value
                  }
                }))
              ]
            }
          })
        }
      })
    },

    async deleteTableData(resource: ResourceContract, ids: string[]) {
      return window.Tensei.api.delete(`/${resource?.slug}`, {
        params: { where: { id: { _in: [...ids] } } }
      })
    }
  }))
)
