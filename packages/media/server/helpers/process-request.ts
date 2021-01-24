import sharp from 'sharp'
import Busboy from 'busboy'
import Crypto from 'crypto'
import Mime from 'mime-types'
import createError from 'http-errors'
import { WriteStream } from 'fs-capacitor'
import { Request, Response } from 'express'
import { DataPayload, ApiContext } from '@tensei/common'
import { MediaLibraryPluginConfig, UploadFile } from '../types'

import { mediaResource } from '../resources'

const ignoreStream = (stream: NodeJS.ReadableStream) => {
    stream.on('error', () => {})

    stream.resume()
}

export const process = (
    request: Request,
    response: Response,
    config: MediaLibraryPluginConfig
) => {
    return new Promise((resolve, reject) => {
        const parser = new Busboy({
            headers: request.headers,
            limits: {
                fieldSize: config.maxFieldSize,
                fields: 2, // Only operations and map.
                fileSize: config.maxFileSize,
                files: config.maxFiles
            }
        })

        let exitError: Error | undefined
        let uploads: any[] = []
        let body: DataPayload = {}
        let released: boolean | undefined
        let currentStream: NodeJS.ReadableStream | undefined

        const exit = (error: Error) => {
            if (exitError) return
            exitError = error

            reject(exitError)

            // @ts-ignore
            if (parser?.destroy) {
                // @ts-ignore
                parser.destroy()
            }

            if (currentStream) {
                // @ts-ignore
                if (currentStream.destroy) {
                    // @ts-ignore
                    currentStream.destroy(exitError)
                }
            }

            request.unpipe(parser)

            // With a sufficiently large request body, subsequent events in the same
            // event frame cause the stream to pause after the parser is destroyed. To
            // ensure that the request resumes, the call to .resume() is scheduled for
            // later in the event loop.
            setImmediate(() => {
                request.resume()
            })
        }

        const release = () => {
            if (released) return
            released = true

            uploads.forEach(upload => upload.file?.capacitor?.release())
        }

        const abort = () => {
            exit(
                createError(
                    499,
                    'Request disconnected during file upload stream parsing.'
                )
            )
        }

        parser.on('field', (fieldname, value, fieldnameTruncated) => {
            if (fieldnameTruncated) {
                return exit(
                    createError(
                        413,
                        `The ‘${fieldname}’ multipart field value exceeds the ${config.maxFieldSize} byte size limit.`
                    )
                )
            }

            body[fieldname] = value
        })

        parser.on('file', (fieldName, stream, filename, encoding, mimetype) => {
            if (exitError) {
                ignoreStream(stream)

                return
            }

            let fileError: Error | undefined

            currentStream = stream
            stream.on('end', () => {
                currentStream = undefined
            })

            const capacitor = new WriteStream()

            capacitor.on('error', () => {
                stream.unpipe()
                stream.resume()
            })

            stream.on('limit', () => {
                fileError = createError(
                    413,
                    `File truncated as it exceeds the ${config.maxFileSize} byte size limit.`
                )
                stream.unpipe()
                capacitor.destroy(fileError)
            })

            stream.on('error', error => {
                fileError = error
                stream.unpipe()
                capacitor.destroy(exitError)
            })

            const file = {
                filename,
                mimetype,
                encoding,
                fieldName,
                createReadStream(name?: string) {
                    const error = fileError || (released ? exitError : null)

                    if (error) throw error

                    return capacitor.createReadStream(name)
                }
            }

            Object.defineProperty(file, 'capacitor', { value: capacitor })

            stream.pipe(capacitor)
            uploads.push(file)
        })

        parser.once('filesLimit', () =>
            exit(
                createError(
                    413,
                    `${config.maxFiles} max file uploads exceeded.`
                )
            )
        )

        parser.once('finish', () => {
            request.unpipe(parser)
            request.resume()

            resolve({
                files: uploads,
                ...body
            })
        })

        parser.once('error', exit)

        response.once('finish', release)
        response.once('close', release)

        request.once('close', abort)
        request.once('end', () => {
            request.removeListener('close', abort)
        })

        request.pipe(parser)
    })
}

export const handle = async (
    ctx: ApiContext,
    config: MediaLibraryPluginConfig
) => {
    let files = ((await Promise.all(ctx.body?.files)) as UploadFile[]).map(
        file => {
            const extension = Mime.extension(file.mimetype)

            const hash = Crypto.randomBytes(24).toString('hex')

            let file_path: string = ctx.body.path || '/'

            file_path = file_path.startsWith('/') ? file_path : `/${file_path}`
            file_path = file_path.endsWith('/') ? file_path : `${file_path}/`

            return {
                ...file,
                hash,
                extension,
                path: file_path,
                storage_filename: `${file_path}${hash}.${extension}`
            }
        }
    )

    await Promise.all(
        files.map(file =>
            ctx.storage
                .disk(config.disk)
                .put(file.storage_filename, file.createReadStream())
        )
    )

    const metacallbacks = (await Promise.all(
        files.map(
            file =>
                new Promise(resolve => {
                    file.createReadStream().pipe(
                        sharp().metadata((error, meta) => {
                            if (error) {
                                resolve(null)
                            }

                            resolve(meta)
                        })
                    )
                })
        )
    )) as sharp.Metadata[]

    await Promise.all([
        Promise.all(
            files.map((file, idx) =>
                Promise.all(
                    config.transformations
                        .map(([t, name]) => [t(metacallbacks[idx]), name])
                        .filter(([t]) => t !== undefined)
                        .map(([transform, name]) => [
                            file
                                .createReadStream()
                                .pipe(transform as sharp.Sharp),
                            name
                        ])
                        .map(([stream, name]) =>
                            ctx.storage
                                .disk(config.disk)
                                .put(
                                    `${file.path}${name}___${file.hash}.${file.extension}`,
                                    stream as NodeJS.ReadableStream
                                )
                        )
                ).catch(ctx.logger.error)
            )
        ).catch(ctx.logger.error)
    ]).catch(ctx.logger.error)

    const savedTransforms = (files.map((file, idx) =>
        config.transformations
            .map(([t, name]) => [
                file,
                `${name}___${file.hash}`,
                t(metacallbacks[idx])
            ])
            .filter(([, , transformed]) => !!transformed)
    ) as unknown) as [[UploadFile, string, sharp.Sharp][]]

    const storedFiles = await Promise.all(
        files.map(file => ctx.storage.disk().getStat(file.storage_filename))
    )

    const storedTransforms = await Promise.all(
        savedTransforms.map(transforms =>
            transforms.length === 0
                ? null
                : Promise.all(
                      transforms.map(([file, name]) =>
                          ctx.storage
                              .disk()
                              .getStat(`${file.path}${name}.${file.extension}`)
                              .catch(() => null)
                      )
                  )
        )
    )

    files = (files.map((file, index) => ({
        ...file,
        size: storedFiles[index].size,
        transformations:
            storedTransforms[index] === null
                ? []
                : storedTransforms[index]!.map((stats, tIndex) => {
                      if (
                          !savedTransforms[index] ||
                          !savedTransforms[index]![tIndex]
                      ) {
                          return null
                      }

                      const [
                          transformedFile,
                          name,
                          sharpInstance
                      ] = savedTransforms[index]![tIndex]

                      return {
                          size: stats?.size,
                          // @ts-ignore
                          width: sharpInstance.options.width,
                          // @ts-ignore
                          height: sharpInstance.options.height,
                          disk: config.disk,
                          mime_type: transformedFile.mimetype,
                          extension: transformedFile.extension,
                          name: name,
                          path: transformedFile.path,
                          hash: name
                      }
                  }).filter(Boolean)
    })) as unknown) as UploadFile[]

    const resourceName = mediaResource(config).data.pascalCaseName

    const entities = files.map((file, idx) =>
        ctx.manager.create(resourceName, {
            size: file.size,
            hash: file.hash,
            path: file.path,
            disk: config.disk,
            mime_type: file.mimetype,
            extension: file.extension,
            name: file.filename,
            width: metacallbacks[idx]?.width,
            height: metacallbacks[idx]?.height,
            transformations: file.transformations.map(t =>
                ctx.manager.create(resourceName, t)
            )
        })
    )

    await ctx.manager.persistAndFlush(entities)

    return entities
}
