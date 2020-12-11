import { resource, boolean } from '@tensei/common'

export default resource('Reaction Hidden From API')
    .fields([boolean('Like')])
    .hideOnApi()
