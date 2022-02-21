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
      exit(createError(413, `${config.maxFiles} max file uploads exceeded.`))
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

      let file_path: string = '/'

      return {
        ...file,
        hash,
        extension,
        path: file_path,
        storage_filename: `${file_path}${hash}.${extension}`
      }
    }
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

  // maybe we should associate the files with the transformations here instead

  const filesWithMetadata = files.map((file, idx) => ({
    file,
    metadata: metacallbacks[idx]
  }))

  const filesWithMetadataAndTransformations = filesWithMetadata.map(
    (file, idx) => ({
      ...file,
      ...file.file,
      transformations: config.transformations
        .map(transform => ({
          ...transform,
          metadataCallback: transform.transformer(metacallbacks[idx]),
          name: transform.transform_name
        }))
        .filter(({ metadataCallback }) => metadataCallback !== undefined)
        .map(transformation => ({
          ...transformation,
          stream: file.file
            .createReadStream()
            .pipe(transformation.metadataCallback as sharp.Sharp)
        }))
    })
  )

  const uploadedMainFiles = await Promise.all(
    files.map(file =>
      ctx.storage
        .disk(config.disk)
        .upload(file.storage_filename, file.createReadStream())
    )
  )

  const uploadedTransformations = await Promise.all(
    filesWithMetadataAndTransformations.map(({ file, transformations }) =>
      Promise.all(
        transformations.map(transformation =>
          ctx.storage
            .disk(config.disk)
            .upload(
              `${file.path}${transformation.transform_name}___${file.hash}.${file.extension}`,
              transformation.stream as NodeJS.ReadableStream
            )
        )
      )
    )
  )

  const transformationsInfoData = await Promise.all(
    filesWithMetadataAndTransformations.map(({ transformations }) =>
      Promise.all(
        transformations.map(transformation =>
          transformation.metadataCallback.metadata()
        )
      )
    )
  )

  const filesWithMetadataAndTransformationsUploaded = filesWithMetadataAndTransformations.map(
    (file, fileIdx) => ({
      ...file.file,
      fileUploadResult: uploadedMainFiles[fileIdx],
      transformations: file.transformations.map(
        (transformation, transformationIdx) => ({
          ...transformation,
          transformationUploadResult:
            uploadedTransformations[fileIdx][transformationIdx],
          metadata: transformationsInfoData[fileIdx][transformationIdx]
        })
      )
    })
  )

  const resourceName = mediaResource(config).data.pascalCaseName

  const entities = filesWithMetadataAndTransformationsUploaded.map(
    (file, idx) =>
      ctx.manager.create(resourceName, {
        size: metacallbacks[idx]?.size,
        hash: file.hash,
        path: file.path,
        disk: config.disk,

        url: file.fileUploadResult.url,
        diskMeta: file.fileUploadResult.metadata,

        mimeType: file.mimetype,
        extension: file.extension,
        name: file.filename,
        width: metacallbacks[idx]?.width,
        height: metacallbacks[idx]?.height,
        transformations: file.transformations.map(t =>
          ctx.manager.create(resourceName, {
            name: t.transform_name,
            mimeType: file.mimetype,
            extension: file.extension,

            hash: file.hash,
            path: file.path,
            disk: config.disk,
            hashPrefix: `${t.transform_name}___`,

            size: metacallbacks[idx]?.size
              ? Math.ceil(
                  metacallbacks[idx]?.size * (t.percentage_reduction / 100)
                )
              : null,

            width: metacallbacks[idx]?.width
              ? Math.ceil(
                  metacallbacks[idx]?.width * (t.percentage_reduction / 100)
                )
              : null,
            height: metacallbacks[idx]?.height
              ? Math.ceil(
                  metacallbacks[idx]?.height * (t.percentage_reduction / 100)
                )
              : null,

            url: t.transformationUploadResult.url,
            diskMeta: t.transformationUploadResult.metadata
          })
        )
      })
  )

  await ctx.manager.persistAndFlush(entities)

  return entities
}
