declare module '@tensei/common/dashboards' {
  import * as CSS from 'csstype'
  import { Request } from 'express'
  import { DateTime } from 'luxon'
  import { ManagerContract, ResourceContract } from '@tensei/common/resources'

  interface DashboardConfig {
    name: string
    slug: string
    group: string
    displayInNavigation: boolean
    cards: (CardContract | MetricContract)[]
  }

  interface CardContract {
    name: string
    slug: string
    text: string
    config: CardConfig
    background: string
    backgroundImage: string
    request: Request | null
    bg: (bg: string) => this
    width: (width: Width) => this
    textColor: (textColor: string) => this
    component: (component: string) => this
    setRequest: (request: Request) => this
    styles: (styles: CSS.Properties) => this
    bgImage: (backgroundImage: string) => this
    serialize: () => SerializedCardContract
  }

  interface SerializedCardContract {
    name: string
    slug: string
    component: string
    width: Width
    textColor: string
    background: string
    backgroundImage: string
    customStyles: CSS.Properties
  }

  interface SerializedDashboardContract {
    name: string
    slug: string
    group: string
    groupSlug: string
    displayInNavigation: boolean
    cards: SerializedCardContract[]
  }

  export interface DashboardContract {
    config: DashboardConfig
    cards: (cards: (CardContract | MetricContract)[]) => this

    serialize: () => SerializedDashboardContract
  }

  interface MetricContract extends CardContract {
    config: MetricConfig
    result: (value: number) => ValueMetricResultContract
    compute: (calculator: ValueMetricCalculatorFunction) => this
    previousRange: (range: string, timezone: string) => [DateTime, DateTime]
    count: (
      resourceSlugOrResource: string | ResourceContract
    ) => Promise<ValueMetricResultContract>
    avg: (
      resourceSlugOrResource: string | ResourceContract,
      columns: string | string[]
    ) => Promise<ValueMetricResultContract>
    min: (
      resourceSlugOrResource: string | ResourceContract,
      columns: string | string[]
    ) => Promise<ValueMetricResultContract>
    max: (
      resourceSlugOrResource: string | ResourceContract,
      columns: string | string[]
    ) => Promise<ValueMetricResultContract>
    selectStyles: (styles: CSS.Properties) => this
  }

  interface ValueMetricContract extends MetricContract {
    config: ValueMetricConfig
  }

  interface CardConfig {
    component: string
    width: Width
  }

  type Width =
    | 'w-full'
    | '1/2'
    | '1/3'
    | '1/4'
    | '2/4'
    | '3/4'
    | '1/7'
    | '2/7'
    | '3/7'
    | '4/7'
    | '5/7'
    | '6/7'
    | '1/12'
    | '2/12'
    | '3/12'
    | '4/12'
    | '5/12'
    | '6/12'
    | '7/12'
    | '8/12'
    | '9/12'

  interface ValueMetricResultConfig {
    options: Intl.NumberFormatOptions
    locale: string
  }
  interface ValueMetricResultContract {
    config: ValueMetricResultConfig
    value: number
    locale(locale: string): this
    currency(currency: string): this
    style(style: string): this
    options(options: Intl.NumberFormatOptions): this
  }

  export const valueMetricResult: (value: number) => ValueMetricResultContract

  type ValueMetricCalculatorFunction = (
    _this: MetricContract
  ) => Promise<ValueMetricResultContract>

  interface MetricConfig extends CardConfig {
    calculator: ValueMetricCalculatorFunction
  }

  interface ValueMetricConfig extends MetricConfig {
    ranges: Array<{ label: string; value: string }>
    selectStyles: CSS.Properties
  }

  type ValueMetricRangeSetter = (
    ranges: ValueMetricConfig['ranges']
  ) => ValueMetricConfig['ranges']

  export const dashboard: (name: string, slug?: string) => DashboardContract

  export const card: (name: string, slug?: string) => CardContract

  export const valueMetric: (name: string, slug?: string) => MetricContract
}
