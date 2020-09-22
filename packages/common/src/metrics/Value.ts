import {
    ValueMetricRangeSetter,
    ValueMetricCalculatorFunction,
    ValueMetricConfig,
    MetricContract
} from '@tensei/common'
import { paramCase, pascalCase } from 'change-case'

import { Card } from '../dashboard/Card'

class ValueMetricResult {
    format() {
        return this
    }
}

export class ValueMetrics extends Card implements MetricContract {
    public config: ValueMetricConfig = {
            ...super.config,
            ranges: {
                '30d': '30 Days',
                '60d': '60 Days',
                '90d': '90 Days',
                'today': 'Today',
            },
            calculator: async () => {
                return 23
            },
    }

    ranges(rangeSetter: ValueMetricRangeSetter) {
        this.config.ranges = rangeSetter(this.config.ranges)

        return this
    }

    public calculate(calculator: ValueMetricCalculatorFunction) {
        this.config.calculator = calculator

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            ranges: this.config.ranges
        }
    }
}

export const valueMetric = (name: string, slug?: string) =>
    new ValueMetrics(name, slug).component('ValueMetric')
