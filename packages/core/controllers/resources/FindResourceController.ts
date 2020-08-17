import Express from 'express'

class FindResourceController {
    public show = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const model = await request.resourceManager.findOneById(
            request,
            request.params.resource,
            request.params.resourceId
        )

        if (!model) {
            return response.status(404).json({
                message: `Resource with id ${request.params.resourceId} was not found.`,
            })
        }

        return response.json(model)
    }

    public showRelation = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        return response.json(
            await request.resourceManager.findAllRelatedResource(
                request,
                request.params.resourceId,
                request.params.resource,
                request.params.relatedResource
            )
        )
    }
}

export default new FindResourceController()
