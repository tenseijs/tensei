import Path from 'path'
import BodyParser from 'body-parser'
import { paramCase } from 'change-case'
import ExpressSession from 'express-session'
import Express, { Application } from 'express'
import AsyncHandler from 'express-async-handler'
import ClientController from './controllers/ClientController'
import AuthController from './controllers/auth/AuthController'
import IndexResourceController from './controllers/resources/IndexResourceController'

import {
    text,
    Tool,
    Asset,
    resource,
    Resource,
    FlamingoConfig,
    ResourceManager,
    SupportedDatabases,
    DatabaseRepositoryInterface,
} from '@flamingo/common'
import CreateResourceController from './controllers/resources/CreateResourceController'
import DeleteResourceController from './controllers/resources/DeleteResourceController'
import FindResourceController from './controllers/resources/FindResourceController'
import UpdateResourceController from './controllers/resources/UpdateResourceController'
import { extend } from 'indicative/validator'

class Flamingo {
    public app: Application = Express()
    public databaseClient: any = null
    public extensions: {
        [key: string]: any
    } = {}
    private toolsBooted: boolean = false
    private databaseBooted: boolean = false
    private registeredApplication: boolean = false
    private databaseRepository: DatabaseRepositoryInterface | null = null

    private config: FlamingoConfig = {
        resources: [],
        tools: [],
        adminTable: 'administrators',
        dashboardPath: 'flamingo',
        apiPath: 'api',
        scripts: [
            {
                name: 'flamingo.js',
                path: Path.resolve(__dirname, 'client', 'index.js'),
            },
        ],
        styles: [
            {
                name: 'flamingo.css',
                path: Path.resolve(__dirname, 'client', 'index.css'),
            },
        ],
        env: {
            port: process.env.PORT || 1377,
            database: (process.env.DATABASE as SupportedDatabases) || 'sqlite',
            sessionSecret: process.env.SESSION_SECRET || 'test-session-secret',
            databaseUrl:
                process.env.DATABASE_URL || 'mysql://root@127.0.0.1/flmg',
        },
    }

    public async register() {
        if (this.registeredApplication) {
            return this
        }

        await this.registerDatabase()

        await this.registerTools()

        // Please do not change this order. Super important so bugs are not introduced.
        this.registerMiddleware()
        this.registerAssetsRoutes()
        this.registerCoreRoutes()

        this.registeredApplication = true

        return this
    }

    public start() {
        this.app.listen(this.config.env.port, () => {
            console.log(
                `App listening on port http://localhost:${this.config.env.port}`
            )
        })

        return this
    }

    public async registerTools() {
        for (let index = 0; index < this.config.tools.length; index++) {
            const tool = this.config.tools[index]

            const extension = await tool.data.setup({
                app: this.app,
                style: (name: Asset['name'], path: Asset['path']) => {
                    this.config.styles = [
                        ...this.config.styles,
                        {
                            name,
                            path,
                        },
                    ]
                },
                script: (name: Asset['name'], path: Asset['path']) => {
                    this.config.scripts = [
                        ...this.config.scripts,
                        {
                            name,
                            path,
                        },
                    ]
                },
                resources: this.config.resources,
            })

            this.extensions = {
                ...this.extensions,
                [paramCase(tool.name)]: extension,
            }
        }

        return this
    }

    public dashboardPath(dashboardPath: string) {
        this.setValue('dashboardPath', dashboardPath)

        return this
    }

    public async registerDatabase() {
        if (this.databaseBooted) {
            return this
        }

        // if database === mysql | sqlite | pg, we'll use the @flamingo/knex package, with either mysql, pg or sqlite3 package
        // We'll require('@flamingo/knex') and require('sqlite3') for example. If not found, we'll install.
        const { Repository } = require('@flamingo/knex')

        const repository: DatabaseRepositoryInterface = new Repository(
            this.config.env
        )

        const client = await repository.setup(this.config)

        this.databaseClient = client
        this.databaseRepository = repository

        this.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                request.db = repository

                next()
            }
        )

        this.databaseBooted = true

        return this
    }

    public apiPath(apiPath: string) {
        this.setValue('apiPath', apiPath)

        return this
    }

    public registerMiddleware() {
        this.app.use(BodyParser.json())

        this.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                request.resources = this.config.resources
                request.administratorResource = this.administratorResource()
                request.resourceManager = new ResourceManager(
                    this.config.resources,
                    this.databaseRepository!
                )

                next()
            }
        )

        const Store = require('connect-session-knex')(ExpressSession)

        this.app.use(
            ExpressSession({
                secret: this.config.env.sessionSecret,
                store: new Store({
                    knex: this.databaseClient,
                }),
                resave: false,
                saveUninitialized: false,
            })
        )
    }

    private getApiPath = (path: string) => {
        return `/${this.config.apiPath}/${path}`
    }

    public registerCoreRoutes() {
        // The administration dashboard
        this.app.get(
            `/${this.config.dashboardPath}(/*)?`,
            this.asyncHandler(ClientController.index)
        )

        this.app.post(
            this.getApiPath('login'),
            this.asyncHandler(AuthController.login)
        )
        this.app.post(
            this.getApiPath('register'),
            this.asyncHandler(AuthController.register)
        )

        this.app.post(
            this.getApiPath('logout'),
            this.asyncHandler(AuthController.logout)
        )

        this.app.get(
            this.getApiPath(`resources/:resource`),
            this.asyncHandler(IndexResourceController.index)
        )

        this.app.get(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.asyncHandler(FindResourceController.show)
        )

        this.app.put(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.asyncHandler(UpdateResourceController.update)
        )

        this.app.patch(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.asyncHandler(UpdateResourceController.update)
        )

        this.app.post(
            this.getApiPath(`resources/:resource`),
            this.asyncHandler(CreateResourceController.store)
        )

        this.app.delete(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.asyncHandler(DeleteResourceController.destroy)
        )

        this.app.use(
            (
                error: any,
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                if (Array.isArray(error)) {
                    return response.status(422).json({
                        message: 'Validation failed.',
                        errors: error,
                    })
                }

                if (error.status === 404) {
                    return response.status(404).json({
                        message: error.message,
                    })
                }

                console.error(error)

                response.status(500).json({
                    message: 'Internal server error.',
                    error,
                })
            }
        )
    }

    public registerAssetsRoutes() {
        this.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                // Set the app config on express here. Should probably get its own function soon.
                request.appConfig = this.config
                request.scripts = this.config.scripts
                request.styles = this.config.styles

                next()
            }
        )

        this.config.scripts.concat(this.config.styles).forEach((asset) => {
            this.app.get(
                `/${asset.name}`,
                this.asyncHandler(
                    (request: Express.Request, response: Express.Response) =>
                        response.sendFile(asset.path)
                )
            )
        })

        if (process.env.NODE_ENV !== 'production') {
            this.app.get(
                `/index.css.map`,
                (request: Express.Request, response: Express.Response) =>
                    response.sendFile(
                        Path.resolve(__dirname, 'client', 'index.css.map')
                    )
            )

            this.app.get(
                `/index.js.map`,
                (request: Express.Request, response: Express.Response) =>
                    response.sendFile(
                        Path.resolve(__dirname, 'client', 'index.js.map')
                    )
            )
        }
    }

    public asyncHandler(handler: Express.Handler) {
        return AsyncHandler(handler)
    }

    private setValue(key: keyof FlamingoConfig, value: any) {
        this.config = {
            ...this.config,
            [key]: value,
        }

        return this
    }

    public resources(resources: Array<Resource>) {
        this.setValue('resources', [this.administratorResource(), ...resources])

        return this
    }

    private administratorResource() {
        const Bcrypt = require('bcryptjs')

        return resource('Administrator')
            .hideFromNavigation()
            .fields([
                text('Name'),
                text('Email').unique().searchable(),
                text('Password'),
            ])
            .beforeCreate((payload) => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password),
            }))
            .beforeUpdate((payload) => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password),
            }))
    }

    public tools(tools: Tool[]) {
        this.config.tools = tools

        return this
    }
}

export const flamingo = (config = {}) => {
    return new Flamingo()
}

export default Flamingo
