import Express from 'express'

class IndexResourceController {
    public index = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { manager } = request

        const resourceManager = manager(request.params.resource)

        await resourceManager.authorize('authorizedToFetch')

        const results = await resourceManager.findAll()

        return response.json(results)
    }
}

export default new IndexResourceController()
