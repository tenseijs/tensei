import { paramCase } from 'change-case'

export interface PlanConfig {
    name: string
    slug: string
    price: number
    trialDays: number
    interval: 'day' | 'week' | 'month' | 'year'
}

class Plan {
    private config: PlanConfig = {
        name: '',
        slug: '',
        price: 0,
        interval: 'month',
        trialDays: 0,
    }

    constructor(name: string, slug?: string) {
        this.config.name = name
        this.config.slug = slug || paramCase(name)
    }

    public price(price: number) {
        this.config.price = price

        return this
    }

    public yearly() {
        this.config.interval = 'year'

        return this
    }

    public monthly() {
        this.config.interval = 'month'

        return this
    }

    public daily() {
        this.config.interval = 'day'

        return this
    }

    public weekly() {
        this.config.interval = 'week'

        return this
    }

    public trialDays(days: number) {
        this.config.trialDays = days

        return this
    }
}

export default Plan
