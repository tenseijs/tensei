import Express from 'express'
import Controller from '../Controller'

class FindResourceController extends Controller {
    public show = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        // const resource = this.findResource(
        //     request.params.resource,
        //     request.resources
        // )
        // if (!resource) {
        //     return response.status(400).json({
        //         message: 'Resource not found.',
        //     })
        // }
        // const resourceInstance = await resource.findOneById(
        //     request.params.resourceId
        // )
        // return response
        //     .status(resourceInstance ? 200 : 404)
        //     .json(resourceInstance)
    }
}

export default new FindResourceController()
