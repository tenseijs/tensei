import Fs from 'fs'
import Path from 'path'
import Dotenv from 'dotenv'
import Express from 'express'
import Mongodb from 'mongodb'
import BodyParser from 'body-parser'
import {
  Config,
  Resource,
  FlamingoServiceProviderInterface,
} from './../typings/interfaces'
import ClientController from '../controllers/ClientController'

import DatabaseRepository from '../database/Repository'

class FlamingoServiceProvider implements FlamingoServiceProviderInterface {
  public app: Express.Application = Express()

  public router: Express.Router = Express.Router()

  public resources: Resource[] = []

  public db: DatabaseRepository | null = null

  public config: Config | null = null

  constructor(public readonly $root: string) {}
  /**
   *
   * Get the path to where the resources are saved.
   *
   * @param root this is the root of the project
   */
  public resourcesIn(root: string) {
    return Path.resolve(root, 'resources')
  }

  public async register() {
    this.registerEnvironmentVariables()

    await this.registerResources()

    this.registerMiddleware()

    await this.registerRoutes()

    this.db = await this.establishDatabaseConnection()
  }

  public registerEnvironmentVariables() {
    Dotenv.config({
      path: Path.resolve(this.$root, '.env'),
    })

    this.registerConfig()
  }

  public registerMiddleware() {
    this.app.use(BodyParser.json())
  }

  public async registerRoutes() {
    this.registerAuthRoutes()

    this.app.use(this.router)
  }

  public launchServer(serverCallback: (config: Config) => void) {
    this.app.listen(this.config!.port, () => serverCallback(this.config!))
  }

  public registerAuthRoutes() {
    this.router.get('*', ClientController.index)
  }

  public async registerResources() {
    const resourcesPath = this.resourcesIn(this.$root)

    this.resources = Fs.readdirSync(resourcesPath)

      .filter((file) => file.substring(file.length - 3) === '.js')

      .map((file) => {
        const Resource = require(Path.resolve(resourcesPath, file))

        return Resource.default ? new Resource.default() : new Resource()
      })
  }

  public async establishDatabaseConnection() {
    const client = new Mongodb.MongoClient(process.env.DATABASE_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    await client.connect()

    return new DatabaseRepository(client.db())
  }

  private registerConfig() {
    this.config = {
      databaseUri: process.env.DATABASE_URI || 'mongodb://localhost/flamingo',
      port: process.env.PORT || 1377,
    }
  }
}

export default FlamingoServiceProvider
