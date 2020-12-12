import { snakeCase } from 'change-case'
import { graphqlUploadExpress } from 'graphql-upload'
import { plugin, belongsTo, hasMany, hasOne } from '@tensei/common'

import { routes } from './routes'
import { queries } from './queries'
import { typeDefs } from './type-defs'
import { mediaResource } from './resources'
import { MediaLibraryPluginConfig } from './types'

class MediaLibrary {
    private config: MediaLibraryPluginConfig = {
        disk: '',
        maxFiles: 10,
        path: 'files',
        maxFieldSize: 1000000, // 1 MB
        maxFileSize: 10000000,
        transformations: []
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

    path(path: string) {
        this.config.path = path.startsWith('/') ? path.substring(1) : path

        return this
    }

    plugin() {
        return plugin('Media Library').register(
            ({
                app,
                currentCtx,
                extendRoutes,
                storageConfig,
                extendResources,
                extendGraphQlTypeDefs,
                extendGraphQlQueries
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

                extendRoutes(routes(this.config))

                extendGraphQlTypeDefs([
                    typeDefs(
                        MediaResource.data.snakeCaseName,
                        MediaResource.data.snakeCaseNamePlural
                    )
                ])

                app.use((request, response, next) => {
                    if (request.path === `/${this.config.path}`) {
                        return next()
                    }

                    return graphqlUploadExpress({
                        maxFiles: this.config.maxFiles,
                        maxFileSize: this.config.maxFileSize
                    })(request, response, next)
                })
            }
        )
    }
}

export const files = (databaseField?: string) => hasMany('File', databaseField ? snakeCase(databaseField) : undefined)
export const file = (databaseField?: string) => hasOne('File', databaseField ? snakeCase(databaseField) : undefined)

export const media = () => new MediaLibrary()
