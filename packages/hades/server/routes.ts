import { route } from '@tensei/common'
import { HadesConfig } from './types'

import { paddle } from './Paddle'

export default (config: HadesConfig) => {
    return [
        route('New Subscription')
            .post()
            .authorize(() => false)
            .path(`${config.portalPath}/subscriptions/new`)
            .handle((request, response) => response.json([]))
    ]
}
