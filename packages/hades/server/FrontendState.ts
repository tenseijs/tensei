import { Request } from 'express'
import { HadesConfig } from './types'

import { paddle } from './Paddle'

class FrontendState {
    constructor(private config: HadesConfig, private request: Request) {}

    private plansWithPrices() {
        return paddle(this.config)
            .prices(this.request.ip)
            .then(prices => {
                return this.config.plans.map(plan => {
                    return {
                        ...plan.serialize(),
                        prices,
                        monthlyPrice: prices.find(
                            (price: any) =>
                                price.product_id.toString() ===
                                plan.serialize().monthlyID?.toString()
                        ),
                        yearlyPrice: prices.find(
                            (price: any) =>
                                price.product_id.toString() ===
                                plan.serialize().yearlyID?.toString()
                        )
                    }
                })
            })
            .catch(e => this.config.plans.map(plan => plan.serialize()))
    }

    async get() {
        return {
            plans: JSON.stringify(await this.plansWithPrices()),
            config: JSON.stringify({
                portalPath: this.config.portalPath
            })
        }
    }
}

export const frontendState = (config: HadesConfig, request: Request) =>
    new FrontendState(config, request)
