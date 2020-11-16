import { AnyEntity, EntityName, FilterQuery } from '@mikro-orm/core'
import Express from 'express'

class DeleteResourceController {
    public destroy = async (
        { body, params, manager, resources }: Express.Request,
        { formatter: { badRequest, noContent } }: Express.Response
    ) => {
        const resourceName = resources[params.resource].data.pascalCaseName
        const modelRepository = manager.getRepository(resourceName as EntityName<AnyEntity<any>>)

        try {
            const model = await modelRepository.findOneOrFail(params.resourceId as FilterQuery<AnyEntity<any>>)

            await modelRepository.removeAndFlush(model)

            return noContent({})
        } catch (error) {
            console.log(error)
            return badRequest({
                message: 'The request was not understood.'
            })
        }
    }
}

export default new DeleteResourceController()
