import { route, ResourceContract, RouteConfig } from '@tensei/common'
import { MediaLibraryPluginConfig } from './types'

import { process, handle } from './helpers/process-request'

const uploadMiddleware = (
  config: MediaLibraryPluginConfig
): RouteConfig['middleware'] => [
  (request, response, next) => {
    if (!request.is('multipart/form-data')) {
      throw request.userInputError(
        `Content type: application/json is not supported for file uploads.`
      )
    }

    const finished = new Promise(resolve => request.on('end', resolve))

    const { send } = response

    response.send = (...args) => {
      finished.then(() => {
        response.send = send
        response.send(...args)
      })

      return response
    }

    process(request, response, config)
      .then(payload => {
        request.body = payload

        next()
      })
      .catch(error => {
        if (error.status && error.expose) {
          response.status(error.status)
        }

        next(error)
      })
  }
]

export const routes = (
  config: MediaLibraryPluginConfig,
  relatedResources: ResourceContract[] = []
) => [
  route('Upload files')
    .id('upload_files')
    .post()
    .path(config.path)
    .noCsrf()
    .middleware(uploadMiddleware(config))
    .handle(async (request, response) => {
      const entities = await handle(request as any, config)

      // @ts-ignore
      return response.formatter.created(entities)
    }),
  ...relatedResources.map(resource =>
    route(`Upload files for ${resource.data.pascalCaseName}`)
      .id(`upload_files_${resource.data.snakeCaseName}`)
      .post()
      .path(`/${resource.data.slugPlural}/:id/files/upload`)
      .middleware(uploadMiddleware(config))
      .handle(async (request, response) => {
        const entity = (await request.manager.findOne(
          resource.data.pascalCaseName,
          request.params.id
        )) as any

        if (!entity) {
          // @ts-ignore
          return response.formatter.notFound(
            `Could not find ${resource.data.pascalCaseName} with ID ${request.params.id}`
          )
        }

        const relatedField = resource.data.fields.find(
          field =>
            field.name === 'File' &&
            ['OneToMany'].includes(field.constructor.name)
        )!

        const entities = (await handle(request as any, config)) as any[]

        request.manager.assign(entity, {
          [relatedField.databaseField]: entities
        } as any)

        await request.manager.persistAndFlush(entity)

        // @ts-ignore
        return response.formatter.created(entities)
      })
  )
]
