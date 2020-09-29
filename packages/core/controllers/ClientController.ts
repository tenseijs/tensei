import Fs from 'fs'
import Path from 'path'
import Express from 'express'
import Mustache from 'mustache'

const indexFileContent = Fs.readFileSync(
    Path.resolve(__dirname, '..', 'index.mustache')
).toString()

class ClientController {
    public async index(request: Express.Request, response: Express.Response) {
        let shouldShowRegistrationScreen = true

        if (
            request.session?.user ||
            (await request.manager('administrators').findAllCount()) > 0
        ) {
            shouldShowRegistrationScreen = false
        }

        response.send(
            Mustache.render(indexFileContent, {
                styles: request.styles,
                scripts: request.scripts,
                user: request.admin ? JSON.stringify(request.admin) : null,
                resources: JSON.stringify(
                    Object.keys(request.resources).map(key =>
                        request.resources[key].serialize()
                    )
                ),
                dashboards: JSON.stringify(
                    Object.keys(request.dashboards).map(key =>
                        request.dashboards[key].serialize()
                    )
                ),
                appConfig: JSON.stringify({
                    dashboardPath: request.appConfig.dashboardPath,
                    apiPath: request.appConfig.apiPath
                }),
                shouldShowRegistrationScreen
            })
        )
    }
}

export default new ClientController()
