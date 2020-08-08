import Express from 'express'
import Controller from '../Controller'

class FindResourceController extends Controller {
    public show = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const model = await request.resourceManager.findOneById(request, request.params.resource, request.params.resourceId)

        if (! model) {
            return response.status(404).json({
                message: `Resource with id ${request.params.resourceId} was not found.`
            })
        }

        return response.json(model)
    }
}

export default new FindResourceController()
