import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ResourceContract, FieldContract } from '@tensei/components'
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
}
interface ResourceMethods extends State {
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
    applyFilter(filter: ActiveFilter) {
      set({
        filters: [...get().filters, filter]
      })
    },
    clearFilter(filter: ActiveFilter) {
      set({
        filters: get().filters.filter(
          activeFilter =>
            activeFilter.field.databaseField === filter.field.databaseField
        )
      })
    },

    async fetchTableData(params: TableDataParams) {
      const { resource } = get()
      const { page, perPage, sort, sortField } = params

      return await window.Tensei.api.get(`/${resource?.slug}`, {
        params: { page, perPage, ...(sortField && { sort }) }
      })
    },

    async deleteTableData(ids: string[]) {
      const { resource } = get()
      return await window.Tensei.api.delete(`/${resource?.slug}`, {
        params: { where: { id: { _in: [...ids] } } }
      })
    }
  }))
)
