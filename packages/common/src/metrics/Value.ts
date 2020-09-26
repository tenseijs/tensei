import {
    ValueMetricRangeSetter,
    ValueMetricCalculatorFunction,
    ValueMetricConfig,
    MetricContract,
    ResourceContract,
} from '@tensei/common'
import * as CSS from 'csstype'
import { DateTime } from 'luxon'

import { Card } from '../dashboard/Card'
import { valueMetricResult } from './ValueMetricResult'

export class ValueMetrics extends Card implements MetricContract {
    public config: ValueMetricConfig = {
        ...super.config,
        ranges: [
            {
                label: '30 Days',
                value: '30d',
            },
            {
                label: '60 Days',
                value: '60d',
            },
            {
                label: '90 Days',
                value: '90d',
            },
            {
                label: 'Today',
                value: 'today',
            },
        ],
        selectStyles: {},
        calculator: async (request) => {
            return this.result(0)
        },
    }

    ranges(rangeSetter: ValueMetricRangeSetter) {
        this.config.ranges = rangeSetter(this.config.ranges)

        return this
    }

    public result(value: number) {
        return valueMetricResult(value)
    }

    public compute = (calculator: ValueMetricCalculatorFunction) => {
        this.config.calculator = calculator.bind(this)

        return this
    }

    public async count(resourceSlugOrResource: string | ResourceContract) {
        const { manager } = this.request!

        const [currentRange, previousRange] = this.getRanges()

        const managerInstance = manager(resourceSlugOrResource)

        const [count, previousCount] = await Promise.all([
            managerInstance.aggregateCount(currentRange),
            managerInstance.aggregateCount(previousRange),
        ])

        return this.result(count).previous(previousCount)
    }

    public async max(
        resourceSlugOrResource: string | ResourceContract,
        columns: string | string[]
    ) {
        const { manager } = this.request!

        const [currentRange, previousRange] = this.getRanges()

        const managerInstance = manager(resourceSlugOrResource)

        const [count, previousCount] = await Promise.all([
            managerInstance.aggregateMax(
                currentRange,
                typeof columns === 'string' ? [columns] : columns
            ),
            managerInstance.aggregateMax(
                previousRange,
                typeof columns === 'string' ? [columns] : columns
            ),
        ])

        return this.result(count).previous(previousCount)
    }

    public async min(
        resourceSlugOrResource: string | ResourceContract,
        columns: string | string[]
    ) {
        const { manager } = this.request!

        const [currentRange, previousRange] = this.getRanges()

        const managerInstance = manager(resourceSlugOrResource)

        const [count, previousCount] = await Promise.all([
            managerInstance.aggregateMin(
                currentRange,
                typeof columns === 'string' ? [columns] : columns
            ),
            managerInstance.aggregateMin(
                previousRange,
                typeof columns === 'string' ? [columns] : columns
            ),
        ])

        return this.result(count).previous(previousCount)
    }

    public async avg(
        resourceSlugOrResource: string | ResourceContract,
        columns: string | string[]
    ) {
        const { manager } = this.request!

        const [currentRange, previousRange] = this.getRanges()

        const managerInstance = manager(resourceSlugOrResource)

        const [count, previousCount] = await Promise.all([
            managerInstance.aggregateAvg(
                currentRange,
                typeof columns === 'string' ? [columns] : columns
            ),
            managerInstance.aggregateAvg(
                previousRange,
                typeof columns === 'string' ? [columns] : columns
            ),
        ])

        return this.result(count).previous(previousCount)
    }

    private getRanges() {
        const { query } = this.request!

        const currentRange = this.currentRange(
            (query.range as string) || 'MTD',
            query.timezone as string
        ).map((dateTime) => dateTime.toString())
        const previousRange = this.previousRange(
            (query.range as string) || 'MTD',
            query.timezone as string
        ).map((dateTime) => dateTime.toString())

        return [currentRange, previousRange] as [
            [string, string],
            [string, string]
        ]
    }

    public currentRange(
        range: string | number,
        timezone: string
    ): [DateTime, DateTime] {
        if (range === 'MTD') {
            return [
                DateTime.local().setZone(timezone).minus({
                    month: 1,
                }),
                DateTime.local().setZone(timezone),
            ]
        }

        if (range === 'YTD') {
            return [
                DateTime.local().setZone(timezone).minus({
                    year: 1,
                }),
                DateTime.local().setZone(timezone),
            ]
        }

        if (range === '30d') {
            return [
                DateTime.local().setZone(timezone).minus({
                    days: 30,
                }),
                DateTime.local().setZone(timezone),
            ]
        }

        if (range === '60d') {
            return [
                DateTime.local().setZone(timezone).minus({
                    days: 60,
                }),
                DateTime.local().setZone(timezone),
            ]
        }

        if (range === '90d') {
            return [
                DateTime.local().setZone(timezone).minus({
                    days: 90,
                }),
                DateTime.local().setZone(timezone),
            ]
        }

        if (range === 'today') {
            return [
                DateTime.local().setZone(timezone).minus({
                    hours: 24,
                }),
                DateTime.local().setZone(timezone),
            ]
        }

        return [
            DateTime.local()
                .setZone(timezone)
                .minus({
                    days: range as number,
                }),
            DateTime.local()
                .setZone(timezone)
                .minus({
                    days: (range as number) * 2,
                }),
        ]
    }

    public previousRange(
        range: string | number,
        timezone: string
    ): [DateTime, DateTime] {
        if (range === 'MTD') {
            return [
                DateTime.local().setZone(timezone).minus({
                    month: 2,
                }),
                DateTime.local().setZone(timezone).minus({
                    month: 1,
                }),
            ]
        }

        if (range === 'YTD') {
            return [
                DateTime.local().setZone(timezone).minus({
                    year: 2,
                }),
                DateTime.local().setZone(timezone).minus({
                    year: 1,
                }),
            ]
        }

        if (range === '30d') {
            return [
                DateTime.local()
                    .setZone(timezone)
                    .minus({
                        days: 30 * 2,
                    }),
                DateTime.local().setZone(timezone).minus({
                    days: 30,
                }),
            ]
        }

        if (range === '60d') {
            return [
                DateTime.local()
                    .setZone(timezone)
                    .minus({
                        days: 60 * 2,
                    }),
                DateTime.local().setZone(timezone).minus({
                    days: 60,
                }),
            ]
        }

        if (range === '90d') {
            return [
                DateTime.local()
                    .setZone(timezone)
                    .minus({
                        days: 90 * 2,
                    }),
                DateTime.local().setZone(timezone).minus({
                    days: 90,
                }),
            ]
        }

        if (range === 'today') {
            return [
                DateTime.local()
                    .setZone(timezone)
                    .minus({
                        hours: 24 * 2,
                    }),
                DateTime.local().setZone(timezone).minus({
                    hours: 24,
                }),
            ]
        }

        return [
            DateTime.local()
                .setZone(timezone)
                .minus({
                    days: range as number,
                }),
            DateTime.local()
                .setZone(timezone)
                .minus({
                    days: (range as number) * 2,
                }),
        ]
    }

    public selectStyles(styles: CSS.Properties) {
        this.config.selectStyles = styles

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            ranges: this.config.ranges,
            selectStyles: this.config.selectStyles,
        }
    }
}

export const valueMetric = (name: string, slug?: string) =>
    new ValueMetrics(name, slug).component('ValueMetric')
