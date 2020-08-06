import Express from 'express'
import Controller from '../Controller'

class UpdateResourceController extends Controller {
    public update = async (
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
        // const [validationFailed, errors] = await this.validate(
        //     request.body,
        //     resource,
        //     false // use update rules
        // )
        // if (validationFailed) {
        //     return response.status(422).json(errors)
        // }
        // // const resourceInstance = await resource.findOneById(request.params.resourceId)
        // const model = await resource
        //     .model(request.body)
        //     .update(request.body, request.params.resourceId)
        // if (!model) {
        //     return response.status(404).json({
        //         message: `Resource with ID ${request.params.resourceId} not found.`,
        //     })
        // }
        // // Check if update was successful.
        // return response.json(model)
    }
}

export default new UpdateResourceController()
