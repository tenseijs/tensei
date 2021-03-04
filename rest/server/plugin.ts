import Path from 'path'
import { plugin } from '@tensei/common'

class Rest {
    plugin() {
        return plugin('rest').boot(({ script, style }) => {
            script(
                'rest.js',
                Path.resolve(__dirname, '..', 'build/client/app.js')
            )
            style(
                'rest.css',
                Path.resolve(__dirname, '..', 'build/client/app.css')
            )
        })
    }
}

const rest = () => new Rest()

export default rest
