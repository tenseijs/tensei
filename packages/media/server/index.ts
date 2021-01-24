import Path from 'path'
import sharp from 'sharp'
import { snakeCase } from 'change-case'
import {
    plugin,
    belongsTo,
    hasMany,
    hasOne,
    ResourceContract
} from '@tensei/common'

import { routes } from './routes'
import { queries } from './queries'
import { typeDefs } from './type-defs'
import { mediaResource } from './resources'
import { MediaLibraryPluginConfig } from './types'

class MediaLibrary {
    private config: MediaLibraryPluginConfig = {
        disk: '',
        maxFiles: 10,
        path: 'files/upload',
        maxFieldSize: 1000000, // 1 MB
        maxFileSize: 10000000,
        transformations: [
            [245, 156, 'thumbnail'],
            [1000, 1000, 'large'],
            [750, 750, 'medium'],
            [500, 500, 'small']
        ].map(dimensions => [
            meta => {
                if (!meta) {
                    return
                }

                const { width, height } = meta

                if (!width || !height) {
                    return
                }

                if (width < dimensions[0] || height < dimensions[0]) {
                    return
                }

                return sharp().resize({
                    width: dimensions[0] as number,
                    height: dimensions[1] as number,
                    fit: 'inside'
                })
            },
            dimensions[2] as string
        ])
    }

    private usesGraphQl: boolean = false

    disk(disk: string) {
        this.config.disk = disk

        return this
    }

    transformations(transforms: MediaLibraryPluginConfig['transformations']) {
        this.config.transformations = [
            ...this.config.transformations,
            ...transforms
        ]

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

    graphql() {
        this.usesGraphQl = true

        return this
    }

    plugin() {
        return plugin('Media Library').register(
            ({
                app,
                script,
                currentCtx,
                extendRoutes,
                storageConfig,
                extendResources,
                extendGraphQlTypeDefs,
                extendGraphQlQueries
            }) => {
                script('media.js', Path.resolve(__dirname, 'public/app.js'))

                if (!this.config.disk) {
                    this.config.disk = storageConfig.default!
                }

                const MediaResource = mediaResource(this.config)

                const { resources } = currentCtx()

                let relatedResources: ResourceContract[] = []

                resources.forEach(resource => {
                    const fileFields = resource.data.fields.filter(
                        f =>
                            f.relatedProperty.type ===
                            MediaResource.data.pascalCaseName
                    )

                    if (fileFields.length) {
                        relatedResources.push(resource)

                        MediaResource.fields([
                            belongsTo(resource.data.name).nullable().hidden()
                        ])
                    }
                })

                extendResources([MediaResource])

                extendRoutes(routes(this.config, relatedResources))

                if (this.usesGraphQl) {
                    extendGraphQlQueries(queries(this.config))
                    extendGraphQlTypeDefs([
                        typeDefs(
                            MediaResource.data.snakeCaseName,
                            MediaResource.data.snakeCaseNamePlural
                        )
                    ])

                    const { graphqlUploadExpress } = require('graphql-upload')

                    app.use((request, response, next) => {
                        if (request.path.includes(`/${this.config.path}`)) {
                            return next()
                        }

                        return graphqlUploadExpress({
                            maxFiles: this.config.maxFiles,
                            maxFileSize: this.config.maxFileSize
                        })(request, response, next)
                    })
                }
            }
        )
    }
}

export const transform = sharp

export const files = (databaseField?: string) =>
    hasMany('File', databaseField ? snakeCase(databaseField) : undefined)
        .label(databaseField || 'Files')
        .formComponent('Files')
        .detailComponent('Files')

export const file = (databaseField?: string) =>
    hasOne('File', databaseField ? snakeCase(databaseField) : undefined)
        .label(databaseField || 'File')
        .formComponent('File')
        .detailComponent('File')

export const media = () => new MediaLibrary()
