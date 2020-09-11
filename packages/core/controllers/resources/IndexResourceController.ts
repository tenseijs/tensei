import Express from 'express'

class IndexResourceController {
    public index = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const results = await request.manager(request.params.resource).findAll()

        return response.json(results)
    }
}

export default new IndexResourceController()
