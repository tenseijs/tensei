import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ResourceContract, FieldContract } from '@tensei/components'

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

interface ResourceMethods extends State {
  findResource: (slug: string) => ResourceContract
  fetchTableData: (
    slug: string,
    page?: number,
    perPage?: number
  ) => Promise<any>
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

    async fetchTableData(slug: string, perPage: number, page: number) {
      const data = await window.Tensei.api.get(
        `/${slug}?perPage=${perPage}&page=${page}`
      )
      return data
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
    }
  }))
)
