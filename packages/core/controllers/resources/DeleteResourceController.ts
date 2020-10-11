import Express from 'express'

class DeleteResourceController {
    public destroy = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { manager } = request

        const resourceManager = manager(request.params.resource)

        await resourceManager.authorize('authorizedToDelete')

        await resourceManager.deleteById(request.params.resourceId)

        return response.status(204).json({})
    }
}

export default new DeleteResourceController()
