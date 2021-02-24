import { Request } from 'express'
import { HadesConfig } from "./types";

import { paddle } from './Paddle'

class FrontendState {
    constructor(private config: HadesConfig, private request: Request) {}

    private plansWithPrices() {
        return paddle(this.config).prices(this.request.ip).then((prices) => {
            return this.config.plans.map(plan => {
                return {
                    ...plan.serialize(),
                    monthlyPrice: prices.find((price: any) => price.product_id === plan.serialize().monthlyID),
                    yearlyPrice: prices.find((price: any) => price.product_id === plan.serialize().yearlyID),
                }
            })
        }).catch((e) => this.config.plans)
    }

    async get() {
        return {
            plans: await this.plansWithPrices()
        }
    }
}

export const frontendState = (config: HadesConfig, request: Request) => new FrontendState(config, request)
