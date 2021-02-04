import Path from 'path'
import { route } from '@tensei/common'

export { tensei } from './Tensei'

export const welcome = () =>
    route('Welcome')
        .path('/')
        .handle((request, response) =>
            response.sendFile(Path.resolve(__dirname, 'welcome.html'))
        )

export * from '@tensei/common'
