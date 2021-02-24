import Axios from 'axios'
import Qs from 'querystring'

import { HadesConfig } from './types'

class Paddle {
    constructor(private config: HadesConfig) {}

    private url = `https://${
        this.config.sandbox ? 'sandbox-' : ''
    }checkout.paddle.com/api/2.0`

    private client = Axios.create({
        baseURL: this.url
    })

    prices(ipAddress?: string, country?: string) {
        const product_ids = this.config.plans
            .map(plan => plan.serialize())
            .reduce(
                (productIds, currentPlan) =>
                    `${productIds}${productIds ? ',' : ''}${
                        currentPlan.monthlyID || ''
                    },${currentPlan.yearlyID || ''}`,
                ``
            )

        const parameters: any = {
            product_ids
        }

        if (ipAddress) {
            parameters.customer_ip = ipAddress
        }

        if (country) {
            parameters.customer_country = country
        }

        return this.client
            .get(`prices?${Qs.stringify(parameters)}`)
            .then(response => response.data.response.products)
            .catch(console.error)
    }
}

export const paddle = (config: HadesConfig) => new Paddle(config)
