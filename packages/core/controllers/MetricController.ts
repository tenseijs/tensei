import Express from 'express'
import { MetricContract } from '@tensei/common'

class MetricController {
    public async index(request: Express.Request, response: Express.Response) {
        const { dashboards, params } = request
        const dashboard = dashboards[params.dashboard]

        if (!dashboard) {
            return response.status(400).json({
                message: `Dashboard ${params.dashboard} does not exist.`
            })
        }

        const metric = dashboard.config.cards.find(
            card => card.slug === params.metric
        ) as MetricContract

        if (!metric) {
            return response.status(400).json({
                message: `Card ${params.metric} does not exist.`
            })
        }

        return response.json(
            await metric.setRequest(request).config.calculator(metric)
        )
    }
}

export default new MetricController()
