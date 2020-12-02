import { plugin, belongsTo } from '@tensei/common'
import { ReferenceType } from '@mikro-orm/core'

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
                extendGraphQlQueries,
                currentCtx
            }) => {
                if (!this.config.disk) {
                    this.config.disk = storageConfig.default!
                }

                const MediaResource = mediaResource()

                const { resources } = currentCtx()

                resources.forEach(resource => {
                    const fileFields = resource.data.fields.filter(
                        f =>
                            f.relatedProperty.type ===
                            MediaResource.data.pascalCaseName
                    )

                    fileFields.forEach(fileField => {
                        MediaResource.fields([
                            belongsTo(resource.data.name).nullable().hidden()
                        ])
                    })
                })

                extendResources([MediaResource])

                extendGraphQlQueries(queries(this.config))

                extendGraphQlTypeDefs([gql(typeDefs)])
            }
        )
    }
}

export const media = () => new MediaLibrary()
