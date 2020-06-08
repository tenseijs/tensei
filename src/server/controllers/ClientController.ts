import Fs from 'fs'
import Path from 'path'
import Express from 'express'
import Mustache from 'mustache'

const indexFileContent = Fs.readFileSync(
  Path.resolve(__dirname, '..', 'index.mustache')
).toString()

class ClientController {
  public index(request: Express.Request, response: Express.Response) {
    response.send(
      Mustache.render(indexFileContent, {
        scripts: request.scripts,
        styles: request.styles
      })
    )
  }
}

export default new ClientController()
