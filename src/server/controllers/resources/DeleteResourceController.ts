import Express from 'express'
import Controller from '../Controller'

class DeleteResourceController extends Controller {
    public destroy = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const resource = this.findResource(
            request.params.resource,
            request.resources
        )

        if (!resource) {
            return response.status(400).json({
                message: 'Resource not found.',
            })
        }

        const model = await resource.destroy(request.params.resourceId)

        if (!model) {
            return response.status(404).json({
                message: `Resource with ID ${request.params.resourceId} not found.`,
            })
        }

        return response.status(204).json({})
    }
}

export default new DeleteResourceController()
