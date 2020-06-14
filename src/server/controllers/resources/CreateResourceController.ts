import Express from 'express'
import Controller from '../Controller'

class CreateResourceController extends Controller {
    public store = async (
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
            resource
        )

        if (validationFailed) {
            return response.status(422).json(errors)
        }

        response.json(request.body)
    }
}

export default new CreateResourceController()
