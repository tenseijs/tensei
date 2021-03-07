import Next from 'next'
import { plugin } from '@tensei/common'

class NextJSPlugin {
    plugin() {
        return plugin('Next JS').boot(async ctx => {
            const app = Next({
                dev: process.env.NODE_ENV !== 'production'
            })

            await app.prepare()

            ctx.app.get('*', (request, response) =>
                app.getRequestHandler()(request, response)
            )
        })
    }
}

export const next = () => new NextJSPlugin()
