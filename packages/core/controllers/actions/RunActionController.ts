import Express from 'express'

class RunActionController {
    public run = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { status, ...rest } = await request.resourceManager.runAction(
            request,
            request.params.resource,
            request.params.action
        )

        return response.status(status).json(rest)
    }
}

export default new RunActionController()
