import {
    ValueMetricResultContract,
    ValueMetricResultConfig
} from '@tensei/common'

export class ValueMetricResult implements ValueMetricResultContract {
    public config: ValueMetricResultConfig = {
        locale: '',
        options: {}
    }

    previousValue: number = 0

    constructor(public value: number) {}

    locale(locale: string) {
        this.config.locale = locale

        return this
    }

    currency(currency: string) {
        this.config.options.currency = currency

        return this
    }

    style(style: string) {
        this.config.options.style = style

        return this
    }

    options(options: Intl.NumberFormatOptions) {
        this.config.options = {
            ...this.config.options,
            ...options
        }

        return this
    }

    previous(previous: number) {
        this.previousValue = previous

        return this
    }
}

export const valueMetricResult = (value: number) => new ValueMetricResult(value)
