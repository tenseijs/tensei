import Express from 'express'

class IndexResourceController {
    public index = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const results = await request.manager.findAll(
            request,
            request.params.resource
        )

        return response.json(results)
    }
}

export default new IndexResourceController()
