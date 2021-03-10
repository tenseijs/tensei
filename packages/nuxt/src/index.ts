import { loadNuxt, build } from 'nuxt'

import { plugin, route } from '@tensei/common'

class NuxtPlugin {
    private config: {
        configure: (nuxt: any) => void
    } = {
        configure: () => {}
    }

    configure(configure: (nuxt: any) => void) {
        this.config.configure = configure

        return this
    }

    plugin() {
        return plugin('Nuxt JS').boot(async ({ app, extendRoutes }) => {
            const isDev = process.env.NODE_ENV !== 'production'

            const nuxt = await loadNuxt(isDev ? 'dev' : 'start')

            this.configure(nuxt)

            if (isDev) {
                build(nuxt)
            }

            extendRoutes([
                route('Nuxt frontend').get().path('*').handle(nuxt.render)
            ])
        })
    }
}

export const nuxt = () => new NuxtPlugin()
