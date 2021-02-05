import Path from 'path'
import { plugin } from '@tensei/common'

export { tensei } from './Tensei'

export const welcome = () =>
    plugin('Welcome').boot(({ app }) => {
        app.get('/', (request, response) =>
            response.sendFile(Path.resolve(__dirname, 'welcome.html'))
        )
    })

export * from '@tensei/common'
