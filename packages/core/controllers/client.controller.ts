import Fs from 'fs'
import Path from 'path'
import Express from 'express'
import Mustache from 'mustache'

const indexFileContent = Fs.readFileSync(
    Path.resolve(__dirname, '..', 'index.mustache')
).toString()

class ClientController {
    public async index(request: Express.Request, response: Express.Response) {
        response.send(
            Mustache.render(indexFileContent, {
                styles: request.styles,
                scripts: request.scripts,
                user: request.user
                    ? JSON.stringify({
                          ...request.user
                      })
                    : null,
                resources: JSON.stringify(
                    Object.keys(request.resources).map(key =>
                        request.resources[key].serialize()
                    )
                ),
                ctx: JSON.stringify({
                    dashboardPath: request.currentCtx().dashboardPath,
                    apiPath: '/cms/api'
                }),
                shouldShowRegistrationScreen:
                    (await request.manager.count('AdminUser')) === 0
            })
        )
    }
}

export default new ClientController()
