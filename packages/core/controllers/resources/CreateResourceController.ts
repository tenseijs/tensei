import { AnyEntity, EntityName } from '@mikro-orm/core'
import Express from 'express'

class CreateResourceController {
    public store = async (
        request: Express.Request,
        { formatter: { badRequest, ok } }: Express.Response
    ) => {
        const { manager, resources, params } = request

        const resource = resources[params.resource]
        try {
            const model = manager.create(resource.data.pascalCaseName as EntityName<AnyEntity<any>>, request.body)

            await manager.persistAndFlush(model)

            return ok(model)
        } catch (error) {
            console.log(error)
            return badRequest({
                message: 'The request was not understood.'
            })
        }
    }
}

export default new CreateResourceController()
