import { graphQlQuery } from '@tensei/common'

import { handle } from './helpers/process-request'
import { MediaLibraryPluginConfig } from './types'

export const queries = (config: MediaLibraryPluginConfig) => [
    graphQlQuery(`Upload files`)
        .path('upload_files')
        .mutation()
        .handle(async (_, args, ctx) => {
            ctx.body = args.object

            return handle(ctx, config)
        })
]
