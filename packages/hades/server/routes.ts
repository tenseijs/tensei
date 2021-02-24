import { route } from '@tensei/common'
import { HadesConfig } from './types'

export default (config: HadesConfig) => {
    return [
        route('New Subscription')
            .post()
            .path(`${config.portalPath}/subscriptions/new`)
            .handle((request, response) => {
                response.json([])
            })
    ]
}
