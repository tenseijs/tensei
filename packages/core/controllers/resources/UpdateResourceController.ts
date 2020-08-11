import Express from 'express'
import Controller from '../Controller'

class UpdateResourceController extends Controller {
    public update = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        await request.resourceManager.update(
            request,
            request.params.resource,
            request.params.resourceId,
            request.body
        )

        return response.json({
            message: 'Resource has been updated.',
        })
    }
}

export default new UpdateResourceController()
