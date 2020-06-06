import Express from 'express'

class ClientController {
    public index(request: Express.Request, response: Express.Response) {
        response.send({
            hello: 'world'
        })
    }
}

export default new ClientController()
