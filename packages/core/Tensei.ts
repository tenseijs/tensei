import Path from 'path'
import { Signale } from 'signale'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import { createServer, Server } from 'http'
import AsyncHandler from 'express-async-handler'
import { validator, sanitizer } from 'indicative'
import { mail, SupportedDrivers } from '@tensei/mail'
import { responseEnhancer } from 'express-response-formatter'
import { StorageManager, Storage } from '@slynova/flydrive'
import Express, { Request, Application, NextFunction } from 'express'

import {
    Asset,
    Config,
    RouteContract,
    PluginContract,
    ResourceContract,
    SetupFunctions,
    InBuiltEndpoints,
    DashboardContract,
    EndpointMiddleware,
    StorageConstructor,
    SupportedStorageDrivers
} from '@tensei/common'
import Database from './database'
import {
    TenseiContract,
    DatabaseConfiguration,
    TensieContext,
    MiddlewareGenerator,
    GraphQlQueryContract,
    PluginSetupConfig
} from '@tensei/core'

export class Tensei implements TenseiContract {
    public app: Application = Express()
    public server: Server = createServer(this.app)
    public extensions: {
        [key: string]: any
    } = {}
    private databaseBooted: boolean = false
    private registeredApplication: boolean = false

    private defaultStorageConfig = {
        default: 'local',
        disks: {
            local: {
                driver: 'local',
                config: {
                    root: `${process.cwd()}/storage`,
                    publicPath: `public`
                }
            }
        }
    }

    public ctx: Config = {
        schemas: [],
        routes: [],
        graphQlQueries: [],
        graphQlTypeDefs: [],
        graphQlMiddleware: [],
        storage: new StorageManager(this.defaultStorageConfig),
        storageConfig: this.defaultStorageConfig,
        mailer: mail().connection('ethereal'),
        databaseClient: null,
        serverUrl: '',
        clientUrl: '',
        resources: [],
        plugins: [],
        dashboards: [],
        resourcesMap: {},
        dashboardsMap: {},
        adminTable: 'administrators',
        dashboardPath: 'admin',
        apiPath: 'api',
        middleware: [],
        orm: null,
        databaseConfig: {
            type: 'sqlite',
            entities: []
        },
        scripts: [
            {
                name: 'tensei.js',
                path: Path.resolve(__dirname, 'client', 'index.js')
            }
        ],
        styles: [
            {
                name: 'tensei.css',
                path: Path.resolve(__dirname, 'client', 'index.css')
            }
        ],
        logger: new Signale(),
        indicative: {
            validator,
            sanitizer
        },
        graphQlExtensions: [],
        extendGraphQlMiddleware: (middleware: MiddlewareGenerator[]) => {
            this.ctx.graphQlMiddleware = [
                ...this.ctx.graphQlMiddleware,
                ...middleware
            ]
        },
        extendResources: (resources: ResourceContract[]) => {
            this.resources(resources)
        }
    }

    public setConfigOnResourceFields() {
        this.ctx.resources.forEach(resource => {
            resource.data.fields.forEach(field => {
                field.tenseiConfig = this.ctx

                field.afterConfigSet()
            })
        })
    }

    public routes(routes: RouteContract[]) {
        this.ctx.routes = [...this.ctx.routes, ...routes]

        return this
    }

    public graphQlQueries(graphQlQueries: GraphQlQueryContract[]) {
        this.ctx.graphQlQueries = [
            ...this.ctx.graphQlQueries,
            ...graphQlQueries
        ]

        return this
    }

    public graphQlTypeDefs(graphQlTypeDefs: TensieContext['graphQlTypeDefs']) {
        this.ctx.graphQlTypeDefs = [
            ...this.ctx.graphQlTypeDefs,
            ...graphQlTypeDefs
        ]

        return this
    }

    private forceMiddleware() {
        this.app.use((request, response, next) => {
            request.req = request

            return next()
        })

        this.app.use((request, response, next) => {
            request.authenticationError = (
                message: string = 'Unauthenticated.'
            ) => ({
                status: 401,
                message
            })

            request.forbiddenError = (message: string = 'Forbidden.') => ({
                status: 400,
                message
            })

            request.validationError = (
                message: string = 'Validation failed.'
            ) => ({
                status: 422,
                message
            })

            request.userInputError = (
                message: string = 'Validation failed.'
            ) => ({
                status: 422,
                message
            })

            return next()
        })
    }

    public async boot() {
        if (this.registeredApplication) {
            return this
        }

        this.setConfigOnResourceFields()

        this.forceMiddleware()

        await this.callPluginHook('register')

        await this.registerDatabase()

        this.registerAssetsRoutes()
        this.registerMiddleware()

        await this.callPluginHook('boot')

        this.registerAsyncErrorHandler()

        return this
    }

    public async start(fn?: (ctx: Config) => any) {
        if (!this.registeredApplication) {
            await this.boot()
        }

        this.registeredApplication = true

        if (fn) {
            const callback = fn(this.ctx)

            if (callback instanceof Promise) {
                fn(this.ctx).then(() => {
                    this.listen()
                })
            } else {
                this.listen()
            }

            return this
        }

        this.listen()

        return this
    }

    private listen() {
        const port = process.env.PORT || 4500

        this.server.listen(port, () => {
            this.ctx.logger.success(
                `🚀 Access your server on ${
                    this.ctx.serverUrl || `http://127.0.0.1:${port}`
                }`
            )
        })
    }

    getPluginArguments: () => PluginSetupConfig = () => {
        let gql: any = (text: string) => text
        try {
            gql = require('apollo-server-express').gql || gql
        } catch (e) {}

        return {
            app: this.app,
            server: this.server,
            ...this.ctx,
            style: (name: Asset['name'], path: Asset['path']) => {
                this.ctx.styles = [
                    ...this.ctx.styles,
                    {
                        name,
                        path
                    }
                ]
            },
            script: (name: Asset['name'], path: Asset['path']) => {
                this.ctx.scripts = [
                    ...this.ctx.scripts,
                    {
                        name,
                        path
                    }
                ]
            },
            manager: this.ctx.orm ? this.ctx.orm.em.fork() : null,
            gql,
            extendGraphQlQueries: (routes: GraphQlQueryContract[]) => {
                this.graphQlQueries(routes)
            },
            extendGraphQlTypeDefs: (
                typeDefs: TensieContext['graphQlTypeDefs']
            ) => {
                this.graphQlTypeDefs(typeDefs)
            },
            extendRoutes: (routes: RouteContract[]) => this.routes(routes),
            currentCtx: () => this.ctx,
            storageDriver: this.storageDriver
        }
    }

    public async callPluginHook(hook: SetupFunctions, payload?: any) {
        for (let index = 0; index < this.ctx.plugins.length; index++) {
            const plugin = this.ctx.plugins[index]

            await plugin.data[hook](payload || this.getPluginArguments())
        }

        return this
    }

    public dashboardPath(dashboardPath: string) {
        this.ctx.dashboardPath = dashboardPath

        return this
    }

    public databaseConfig(databaseConfig: DatabaseConfiguration) {
        this.ctx.databaseConfig = databaseConfig

        return this
    }

    public getDatabaseClient = () => {
        return this.ctx.databaseClient
    }

    private async bootDatabase() {
        const [orm, schemas] = await new Database(this.ctx).init()

        this.ctx.orm = orm
        this.ctx.schemas = schemas
    }

    public async registerDatabase() {
        if (this.databaseBooted) {
            return this
        }

        await this.bootDatabase()

        this.databaseBooted = true

        return this
    }

    public apiPath(apiPath: string) {
        this.ctx.apiPath = apiPath

        return this
    }

    public getSessionPackage() {
        if (['mongodb'].includes(this.ctx.databaseConfig.type)) {
            return 'connect-mongo'
        }

        return 'connect-session-knex'
    }

    getSessionPackageConfig(Store: any) {
        let storeArguments: any = {}

        if (
            ['mysql', 'pg', 'sqlite3', 'sqlite'].includes(
                this.ctx.databaseConfig.type
            )
        ) {
            storeArguments = {
                knex: this.ctx.databaseClient
            }
        }

        if (['mongodb'].includes(this.ctx.databaseConfig.type)) {
            storeArguments = {
                mongooseConnection: require('mongoose').connection
            }
        }

        return {
            secret: process.env.SESSION_SECRET || 'tensei-session-secret',
            store: new Store(storeArguments),
            resave: false,
            saveUninitialized: false
        }
    }

    public registerCoreRoutes() {}

    public registerMiddleware() {
        this.app.use(BodyParser.json())

        this.app.use(responseEnhancer())

        this.app.use(CookieParser())

        this.app.disable('x-powered-by')

        const rootStorage = (this.ctx.storageConfig.disks?.local?.config as any)
            .root
        const publicPath = (this.ctx.storageConfig.disks?.local?.config as any)
            .publicPath

        if (rootStorage && publicPath) {
            this.app.use(Express.static(`${rootStorage}/${publicPath}`))
        }

        this.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                request.dashboards = this.ctx.dashboardsMap
                request.resources = this.ctx.resourcesMap
                request.manager = this.ctx.orm!.em.fork()
                request.mailer = this.ctx.mailer
                request.config = this.ctx

                next()
            }
        )
    }

    public registerAsyncErrorHandler() {
        this.app.use(
            (
                error: any,
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                this.ctx.logger.error(error)
                if (Array.isArray(error)) {
                    return response.status(422).json({
                        message: 'Validation failed.',
                        errors: error
                    })
                }

                if (error.status === 404) {
                    return response.status(404).json({
                        message: error.message
                    })
                }

                if (error.status) {
                    return response.status(error.status).json({
                        message: error.message || 'Internal server error.'
                    })
                }

                response.status(500).json({
                    message: 'Internal server error.',
                    error
                })
            }
        )
    }

    public serverUrl(url: string) {
        this.ctx.serverUrl = url

        return this
    }

    public clientUrl(url: string) {
        this.ctx.clientUrl = url

        return this
    }

    public registerAssetsRoutes() {
        this.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                // Set the app config on express here. Should probably get its own function soon.
                request.config = this.ctx
                request.scripts = this.ctx.scripts
                request.styles = this.ctx.styles

                next()
            }
        )

        this.ctx.scripts.concat(this.ctx.styles).forEach(asset => {
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

    private asyncHandler(handler: Express.Handler) {
        return AsyncHandler(handler)
    }

    public resources(resources: ResourceContract[]) {
        const updatedResources = [...this.ctx.resources, ...resources]

        const uniqueResources = Array.from(
            new Set(updatedResources.map(resource => resource.data.name))
        )
            .map(resourceName =>
                updatedResources.find(
                    resource => resource.data.name === resourceName
                )
            )
            .filter(Boolean) as ResourceContract[]

        this.ctx.resources = uniqueResources

        const resourcesMap: Config['resourcesMap'] = {}

        uniqueResources.forEach(resource => {
            resourcesMap[resource.data.slug] = resource
            resourcesMap[resource.data.pascalCaseName] = resource
        })

        this.ctx.resourcesMap = resourcesMap

        return this
    }

    public dashboards(dashboards: DashboardContract[]) {
        const updatedDashboards = [...this.ctx.dashboards, ...dashboards]

        this.ctx.dashboards = Array.from(
            new Set(updatedDashboards.map(dashboard => dashboard.config.name))
        )
            .map(resourceName =>
                updatedDashboards.find(
                    dashboard => dashboard.config.name === resourceName
                )
            )
            .filter(Boolean) as DashboardContract[]

        this.ctx.dashboards.forEach(dashboard => {
            this.ctx.dashboardsMap[dashboard.config.slug] = dashboard
        })

        return this
    }

    public plugins(plugins: PluginContract[]) {
        this.ctx.plugins = plugins

        return this
    }

    private mail(driverName: SupportedDrivers, mailConfig = {}) {
        this.ctx.mailer = mail().connection(driverName).config(mailConfig)

        return this
    }

    private storageDriver<
        StorageDriverImplementation extends Storage,
        DriverConfig extends unknown
    >(
        driverName: SupportedStorageDrivers,
        driverConfig: DriverConfig,
        storageImplementation: StorageConstructor<StorageDriverImplementation>
    ) {
        this.ctx.storageConfig = {
            ...this.ctx.storageConfig,
            disks: {
                ...this.ctx.storageConfig.disks,
                [driverName]: {
                    driver: driverName,
                    config: driverConfig
                }
            }
        }

        this.ctx.storage = new StorageManager(this.ctx.storageConfig)

        this.ctx.storage.registerDriver<StorageDriverImplementation>(
            driverName,
            storageImplementation
        )

        return this
    }

    public defaultStorageDriver(driverName: string) {
        this.ctx.storageConfig = {
            ...this.ctx.storageConfig,
            default: driverName
        }

        this.ctx.storage = new StorageManager(this.ctx.storageConfig)

        return this
    }
}

export const tensei = () => {
    return new Tensei()
}

export default Tensei
