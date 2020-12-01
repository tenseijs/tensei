import { plugin } from '@tensei/common'

import { queries } from './queries'
import { typeDefs } from './type-defs'
import { mediaResource } from './resources'
import { MediaLibraryPluginConfig } from './types'

class MediaLibrary {
    private config: MediaLibraryPluginConfig = {
        disk: ''
    }

    disk(disk: string) {
        this.config.disk = disk

        return this
    }

    plugin() {
        return plugin('Media Library').register(
            ({
                gql,
                storageConfig,
                extendResources,
                extendGraphQlTypeDefs,
                extendGraphQlQueries
            }) => {
                if (!this.config.disk) {
                    this.config.disk = storageConfig.default!
                }

                extendResources([mediaResource()])

                extendGraphQlQueries(queries(this.config))

                extendGraphQlTypeDefs([gql(typeDefs)])
            }
        )
    }
}

export const media = () => new MediaLibrary()
