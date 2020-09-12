import Express from 'express'

class FindResourceController {
    public show = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const model = await request
            .manager(request.params.resource)
            .findOneById(request.params.resourceId)

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
            await request
                .manager(request.params.resource)
                .findAllRelatedResource(
                    request.params.resourceId,
                    request.params.relatedResource
                )
        )
    }
}

export default new FindResourceController()
