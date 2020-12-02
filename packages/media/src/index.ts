import { graphqlUploadExpress } from 'graphql-upload'
import { plugin, belongsTo, hasMany } from '@tensei/common'

import { queries } from './queries'
import { typeDefs } from './type-defs'
import { mediaResource } from './resources'
import { MediaLibraryPluginConfig } from './types'

class MediaLibrary {
    private config: MediaLibraryPluginConfig = {
        disk: '',
        maxFileSize: 10000000,
        maxFiles: 10
    }

    disk(disk: string) {
        this.config.disk = disk

        return this
    }

    maxFileSize(max: number) {
        this.config.maxFileSize = max

        return this
    }

    maxFiles(max: number) {
        this.config.maxFiles = max

        return this
    }

    plugin() {
        return plugin('Media Library').register(
            ({
                gql,
                app,
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

                    if (fileFields.length) {
                        MediaResource.fields([
                            belongsTo(resource.data.name).nullable().hidden()
                        ])
                    }
                })

                extendResources([MediaResource])

                extendGraphQlQueries(queries(this.config))

                extendGraphQlTypeDefs([gql(typeDefs)])

                app.use(
                    graphqlUploadExpress({
                        maxFiles: this.config.maxFiles,
                        maxFileSize: this.config.maxFileSize
                    })
                )
            }
        )
    }
}

export const files = (databaseField?: string) => hasMany('File', databaseField)

export const media = () => new MediaLibrary()
