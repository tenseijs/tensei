import Crypto from 'crypto'
import { processRequest } from 'graphql-upload'
import { graphQlQuery } from '@tensei/common'

import { mediaResource } from './resources'

import { UploadFile, MediaLibraryPluginConfig } from './types'

export const queries = (config: MediaLibraryPluginConfig) => [
    graphQlQuery(`Upload files`)
        .path('upload_files')
        .mutation()
        .handle(async (_, args, ctx) => {
            let files = ((await Promise.all(
                args.object?.files
            )) as UploadFile[]).map(file => {
                const [, extension] = file.filename.split('.')
                const hash = Crypto.randomBytes(48).toString('hex')

                let file_path: string = args.object.path || '/'

                file_path = file_path.startsWith('/')
                    ? file_path
                    : `/${file_path}`
                file_path = file_path.endsWith('/')
                    ? file_path
                    : `${file_path}/`

                return {
                    ...file,
                    hash,
                    extension,
                    path: file_path,
                    storage_filename: `${file_path}${hash}.${extension}`
                }
            })

            await Promise.all(
                files.map(file =>
                    ctx.storage
                        .disk(config.disk)
                        .put(
                            `${file.storage_filename}`,
                            file.createReadStream()
                        )
                )
            )

            const storedFiles = await Promise.all(
                files.map(file =>
                    ctx.storage.disk().getStat(file.storage_filename)
                )
            )

            files = files.map((file, index) => ({
                ...file,
                size: storedFiles[index].size
            }))

            const fileEntities = files.map(file =>
                ctx.manager.create(
                    mediaResource(config.mediaResourceName).data.pascalCaseName,
                    {
                        size: file.size,
                        hash: file.hash,
                        path: file.path,
                        disk: config.disk,
                        mime_type: file.mimetype,
                        extension: file.extension,
                        original_filename: file.filename
                    }
                )
            )

            await ctx.manager.persistAndFlush(fileEntities)

            return fileEntities
        })
]
