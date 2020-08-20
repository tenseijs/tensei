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
            (await request.db.getAdministratorsCount()) > 0
        ) {
            shouldShowRegistrationScreen = false
        }

        response.send(
            Mustache.render(indexFileContent, {
                styles: request.styles,
                scripts: request.scripts,
                user: request.admin ? JSON.stringify(request.admin) : null,
                resources: JSON.stringify(
                    Object.keys(request.resources).map((key) =>
                        request.resources[key].serialize()
                    )
                ),
                appConfig: JSON.stringify({
                    dashboardPath: request.appConfig.dashboardPath,
                }),
                shouldShowRegistrationScreen,
            })
        )
    }
}

export default new ClientController()
