import Express from 'express'

class UpdateResourceController {
    public update = async (
        { method, body, params, manager }: Express.Request,
        response: Express.Response
    ) => {
        const updated = await manager(params.resource).update(
            params.resourceId,
            body,
            method === 'PATCH'
        )

        return response.json(updated)
    }
}

export default new UpdateResourceController()
