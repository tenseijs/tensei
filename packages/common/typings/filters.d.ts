declare module '@tensei/common/filters' {
  import { Request } from 'express'
  import { FieldContract } from '@tensei/core'
  import { FilterQuery, Dictionary } from '@mikro-orm/core'

  interface FilterConfig<T> {
    name: string
    shortName: string
    args?: boolean
    default: boolean
    dashboardView?: boolean
    cond: FilterCondition<T>
    fields: FieldContract[]
  }

  type FilterCondition<T = any> = (
    args: Dictionary,
    request: Request,
    type: 'read' | 'update' | 'delete'
  ) => FilterQuery<any> | Promise<FilterQuery<T>>

  export interface FilterContract<T = any> {
    config: FilterConfig<T>
    query(condition: FilterCondition<T>): this
    dashboardView(): this
    noArgs(): this
    default(): this
  }

  export function filter<T = any>(
    name: string,
    slug?: string
  ): FilterContract<T>
}
