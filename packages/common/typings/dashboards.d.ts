declare module '@tensei/common/dashboards' {
    import { ManagerContract } from '@tensei/common/resources'

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
        config: CardConfig
        width: (width: Width) => this
        component: (component: string) => this
        serialize: () => SerializedCardContract
    }

    interface SerializedCardContract {
        name: string
        slug: string
        component: string
        width: Width
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
        calculate: (calculator: ValueMetricCalculatorFunction) => this
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

    interface ValueMetricResult {}

    type ValueMetricCalculatorFunction = (
        manager: ManagerContract['setResource']
    ) => Promise<ValueMetricResult>

    interface MetricConfig extends CardConfig {
        calculator: ValueMetricCalculatorFunction
    }

    interface ValueMetricConfig extends MetricConfig {
        ranges: { [key: string]: string }
    }

    type ValueMetricRangeSetter = (ranges: {
        [key: string]: string
    }) => {
        [key: string]: string
    }

    export const dashboard: (name: string, slug?: string) => DashboardContract

    export const card: (name: string, slug?: string) => CardContract

    export const valueMetric: (name: string, slug?: string) => MetricContract
}
