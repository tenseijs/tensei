import Express from 'express'
import Controller from '../Controller'

class IndexResourceController extends Controller {
    public index = async (
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

        const [successful, filters, errors] = await resource.parseQueryFilters(
            request.query
        )

        if (!successful) {
            return response.status(400).json(errors)
        }

        const data = await resource.findAll(
            filters,
            resource.parseQueryParams(request.query)
        )

        return response.json(data)
    }
}

export default new IndexResourceController()
