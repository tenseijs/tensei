import Express from 'express'

class DeleteResourceController {
    public destroy = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        await request.manager(request.params.resource).deleteById(
            request.params.resourceId
        )

        return response.status(204).json({})
    }
}

export default new DeleteResourceController()
