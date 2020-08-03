import Path from 'path'
import Consola from 'consola'
import BodyParser from 'body-parser'
import ExpressSession from 'express-session'
import Express, { Application } from 'express'
import { Asset } from './typings/interfaces'
import Resource from './resources/ResourceManager'

interface FlamingoEnv {
    port: string|number
    sessionSecret: string
    databaseUrl: string
}

interface FlamingoConfig {
    resources: Resource[],
    app: Application,
    scripts: Asset[],
    styles: Asset[],
    env: FlamingoEnv
}

class Flamingo {
    private config: FlamingoConfig = {
        resources: [],
        app: Express(),
        scripts: [{
            name: 'flamingo.js',
            path: Path.join(__dirname, '..', 'client', 'index.js'),
        }],
        styles: [{
            name: 'flamingo.css',
            path: Path.join(__dirname, '..', 'client', 'index.css'),
        }],
        env: {
            port: process.env.PORT || 1377,
            sessionSecret: process.env.SESSION_SECRET || 'test-session-secret',
            databaseUrl: process.env.DATABASE_URL || 'mysql://root@127.0.0.1/flmg'
        }
    }

    public async start() {
        this.registerAssetsRoutes()

        // await this.$serviceProvider.register()

        this.config.app.listen(this.config.env.port, () => {
            Consola.success('Server started on port')
        })
    }

    public registerMiddleware() {
        this.config.app.use(BodyParser.json())

        const Store = require('connect-session-knex')(ExpressSession)

        this.config.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                request.resources = this.config.resources

                next()
            }
        )

        this.config.app.use(
            ExpressSession({
                secret: this.config.env.sessionSecret,
                store: new Store({}),
                resave: false,
                saveUninitialized: false,
            })
        )
    }

    public registerAssetsRoutes() {
        this.config.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                request.scripts = this.config.scripts
                request.styles = this.config.styles

                next()
            }
        )

        this.config.scripts.forEach((asset) => {
            this.config.app.get(
                `/${asset.name}`,
                (request: Express.Request, response: Express.Response) =>
                    response.sendFile(asset.path)
            )
        })
    }

    private setValue(key: keyof FlamingoConfig, value: any) {
        this.config = {
            ...this.config,
            [key]: value
        }

        return this
    }

    public resources(resources: Array<Resource>) {
        this.setValue('resources', resources)

        return this
    }
}

export const flamingo = () => {
    return new Flamingo()
}

export default Flamingo
