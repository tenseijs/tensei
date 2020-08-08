import Express from 'express'
import Controller from '../Controller'

class CreateResourceController extends Controller {
    public store = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const model = await request.resourceManager.create(
            request,
            request.params.resource,
            request.body
        )

        return response.json(model)
    }
}

export default new CreateResourceController()
