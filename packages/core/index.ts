import Path from 'path'
import Cors from 'cors'
import { plugin } from '@tensei/common'

export { tensei } from './Tensei'

export const welcome = () =>
    plugin('Welcome').boot(({ app }) => {
        app.get('/', (request, response) =>
            response.sendFile(Path.resolve(__dirname, 'welcome.html'))
        )
    })

export const cors = (baseOptions?: Cors.CorsOptions) =>
    plugin('Cors').boot(({ app, clientUrl }) => {
        const options: Cors.CorsOptions = {
            ...(baseOptions || {})
        }

        if (clientUrl && !options.origin) {
            options.origin = clientUrl
        }

        app.use(Cors(options))
    })

export * from '@tensei/common'
