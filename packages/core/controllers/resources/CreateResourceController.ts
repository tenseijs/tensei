import Express from 'express'

class CreateResourceController {
    public store = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const model = await request.manager(request.params.resource).create(
            request.body
        )

        return response.status(201).json(model)
    }
}

export default new CreateResourceController()
