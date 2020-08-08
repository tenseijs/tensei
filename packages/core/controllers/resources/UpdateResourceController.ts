import Express from 'express'
import Controller from '../Controller'

class UpdateResourceController extends Controller {
    public update = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        return response.json({})
    }
}

export default new UpdateResourceController()
