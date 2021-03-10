import Next from 'next'
import { plugin, route } from '@tensei/common'

class NextJSPlugin {
    plugin() {
        return plugin('Next JS').boot(async ctx => {
            const app = Next({
                dev: process.env.NODE_ENV !== 'production'
            })

            await app.prepare()

            ctx.extendRoutes([
                route('Next frontend')
                    .get()
                    .path('*')
                    .handle((request, response) =>
                        app.getRequestHandler()(request, response)
                    )
            ])
        })
    }
}

export const next = () => new NextJSPlugin()
