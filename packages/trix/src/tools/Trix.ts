import Path from 'path'
import { tool } from '@flamingo/common'

export const trixTool = () => tool('Trix').setup(async ({ script, style }) => {
    script(
        'trix-editor.js',
        Path.resolve(__dirname, '..', '..', 'build/client/index.js')
    )

    style('trix-editor.css', Path.resolve(__dirname, '..', '..', 'build/client/index.css'))

    return null
})
