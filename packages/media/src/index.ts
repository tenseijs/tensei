import { graphqlUploadExpress } from 'graphql-upload'
import { plugin, belongsTo, hasMany } from '@tensei/common'

import { queries } from './queries'
import { typeDefs } from './type-defs'
import { mediaResource } from './resources'
import { MediaLibraryPluginConfig } from './types'

class MediaLibrary {
    private config: MediaLibraryPluginConfig = {
        disk: '',
        maxFiles: 10,
        maxFileSize: 10000000,
        mediaResourceName: 'File'
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
                app,
                currentCtx,
                storageConfig,
                extendResources,
                extendGraphQlTypeDefs,
                extendGraphQlQueries
            }) => {
                if (!this.config.disk) {
                    this.config.disk = storageConfig.default!
                }

                const MediaResource = mediaResource(
                    this.config.mediaResourceName
                )

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

                extendGraphQlTypeDefs([
                    typeDefs(
                        MediaResource.data.snakeCaseName,
                        MediaResource.data.snakeCaseNamePlural
                    )
                ])

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
