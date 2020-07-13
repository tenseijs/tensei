import Express from 'express'
import Controller from '../Controller'

class UpdateResourceController extends Controller {
    public update = async (
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

        const [validationFailed, errors] = await this.validate(
            request.body,
            resource,
            false // use update rules
        )

        if (validationFailed) {
            return response.status(422).json(errors)
        }

        // const resourceInstance = await resource.findOneById(request.params.resourceId)

        resource.model(request.body)

        return response.status({} ? 200 : 404).json({})
    }
}

export default new UpdateResourceController()
