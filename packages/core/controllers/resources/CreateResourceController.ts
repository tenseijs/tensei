import Express from 'express'

class CreateResourceController {
    public store = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { manager } = request

        const resourceManager = manager(request.params.resource)

        await resourceManager.authorize('authorizedToCreate')

        const model = await resourceManager.create(request.body)

        return response.status(201).json(model)
    }
}

export default new CreateResourceController()
