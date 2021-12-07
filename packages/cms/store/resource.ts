import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ResourceContract, FieldContract, AbstractData } from '@tensei/components'
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
  filters: ActiveFilter[]
}
interface TableDataParams {
  perPage?: number
  page?: number
  sort?: string
  sortField: string
  search?: string
}
interface ResourceMethods extends State {

  createResource: (
    resourceInput: AbstractData
  ) => Promise<[AxiosResponse | null, AxiosError | null]>

  updateResource: (
    resourceId: number,
    resourceInput: AbstractData
  ) => Promise<[AxiosResponse | null, AxiosError | null]>

  fetchResourceData: (
    resourceId: number
  ) => Promise<[AxiosResponse | null, AxiosError | null]>

  findResource: (slug: string) => ResourceContract

  fetchTableData: (
    params: TableDataParams
  ) => Promise<[AxiosResponse | null, Error | null]>

  deleteTableData: (
    id: string[]
  ) => Promise<[AxiosResponse | null, Error | null]>

  applyFilter: (filter: ActiveFilter) => void

  clearFilter: (filter: ActiveFilter) => void
}

export const useResourceStore = create<ResourceState & ResourceMethods>(
  devtools((set, get) => ({
    filters: [],

    async createResource(resourceInput: AbstractData) {
      const { resource } = get()
      return await window.Tensei.api.post(resource?.slugPlural!, resourceInput)
    },

    async updateResource(resourceId: number, resourceInput: AbstractData) {
      const { resource } = get()
      return await window.Tensei.api.patch(`${resource?.slugPlural!}/${resourceId}`, resourceInput)
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

    fetchResourceData(resourceId: number) {
      const { resource } = get()
      return window.Tensei.api.get(`/${resource?.slug}/${resourceId}`);
    },

    applyFilter(filter: ActiveFilter) {
      set({
        filters: [...get().filters, filter]
      })
    },

    clearFilter(filter: ActiveFilter) {
      set({
        filters: get().filters.filter(
          activeFilter =>
            activeFilter.field.databaseField !== filter.field.databaseField
        )
      })
    },

    async fetchTableData(params: TableDataParams) {
      const { resource, filters } = get()
      const { page, perPage, sort, sortField, search } = params

      return window.Tensei.api.get(`/${resource?.slug}`, {
        params: {
          page,
          perPage,
          ...(sortField && { sort }),
          ...(search && { search }),
          ...(filters.length && {
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

    async deleteTableData(ids: string[]) {
      const { resource } = get()

      return window.Tensei.api.delete(`/${resource?.slug}`, {
        params: { where: { id: { _in: [...ids] } } }
      })
    }
  }))
)
