import { AnyEntity, EntityName, FilterQuery } from '@mikro-orm/core'
import Express from 'express'

class UpdateResourceController {
    public update = async (
        { body, params, manager, resources }: Express.Request,
        { formatter: { badRequest, ok, notFound } }: Express.Response
    ) => {

        const resourceName = resources[params.resource].data.pascalCaseName

        try {
            const model = manager.findOne(resourceName as EntityName<AnyEntity<any>>, params.resourceId as FilterQuery<AnyEntity<any>>)

            if (!model) {
                return notFound(`Could not find resourceName with ID of ${params.resourceId}`)
            }

            manager.assign(resourceName as EntityName<AnyEntity<any>>, body)

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

export default new UpdateResourceController()
