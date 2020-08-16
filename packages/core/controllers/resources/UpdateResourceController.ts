import Express from 'express'

class UpdateResourceController {
    public update = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const updated = await request.resourceManager.update(
            request,
            request.params.resource,
            request.params.resourceId,
            request.body,
            request.method === 'PATCH'
        )

        return response.json(updated)
    }
}

export default new UpdateResourceController()
