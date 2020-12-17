import { route } from '@tensei/common'
import { MediaLibraryPluginConfig } from './types'

import { process, handle } from './helpers/process-request'

export const routes = (config: MediaLibraryPluginConfig) => [
    route('Upload files')
        .id('upload_files')
        .post()
        .path(config.path)
        .middleware([
            (request, response, next) => {
                if (!request.is('multipart/form-data')) {
                    throw request.userInputError(
                        `Content type: application/json is not supported for file uploads.`
                    )
                }

                const finished = new Promise(resolve =>
                    request.on('end', resolve)
                )

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
        ])
        .handle(async (request, response) => {
            const entities = await handle(request as any, config)

            // @ts-ignore
            return response.formatter.created(entities)
        })
]
