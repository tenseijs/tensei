import Express from 'express'
import Controller from '../Controller'

class DeleteResourceController extends Controller {
    public destroy = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        await request.resourceManager.deleteById(request, request.params.resource, request.params.resourceId)

        return response.status(204).json({})
    }
}

export default new DeleteResourceController()
