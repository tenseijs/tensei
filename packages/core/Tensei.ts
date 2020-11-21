import Path from 'path'
import { Signale } from 'signale'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import { RequestContext } from '@mikro-orm/core'
import AsyncHandler from 'express-async-handler'
import { validator, sanitizer } from 'indicative'
import { mail, SupportedDrivers, Mail } from '@tensei/mail'
import { responseEnhancer } from 'express-response-formatter'
import {
    StorageManager,
    Storage,
    StorageManagerConfig
} from '@slynova/flydrive'
import Express, { Request, Application, NextFunction } from 'express'

import {
    text,
    Asset,
    Config,
    Manager,
    resource,
    RouteContract,
    PluginContract,
    ResourceContract,
    SetupFunctions,
    ManagerContract,
    InBuiltEndpoints,
    DashboardContract,
    SupportedDatabases,
    EndpointMiddleware,
    StorageConstructor,
    SupportedStorageDrivers,
    DatabaseRepositoryInterface
} from '@tensei/common'
import Database from './database'
import {
    TenseiContract,
    DatabaseConfiguration,
    GraphQLPluginExtension,
    TensieContext,
    MiddlewareGenerator,
    GraphQlQueryContract
} from '@tensei/core'
import { IMiddleware, IMiddlewareGenerator } from 'graphql-middleware'

export class Tensei implements TenseiContract {
    public app: Application = Express()
    public extensions: {
        [key: string]: any
    } = {}
    private databaseBooted: boolean = false
    private registeredApplication: boolean = false
    private storageConfig: StorageManagerConfig = {
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
    public storage: StorageManager = new StorageManager(this.storageConfig)

    public ctx: Config = {
        schemas: [],
        routes: [],
        graphQlQueries: [],
        graphQlTypeDefs: [],
        graphQlMiddleware: [],
        mailer: mail().connection('ethereal'),
        databaseClient: null,
        serverUrl: '',
        clientUrl: '',
        resources: [],
        plugins: [],
        dashboards: [],
        resourcesMap: {},
        dashboardsMap: {},
        pushResource: (resource: ResourceContract) =>
            this.resources([...this.ctx.resources, resource]),
        adminTable: 'administrators',
        dashboardPath: 'admin',
        apiPath: 'api',
        middleware: [],
        pushMiddleware: (middleware: EndpointMiddleware) => {
            this.ctx.middleware = [...this.ctx.middleware, middleware]
        },
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

    public async boot() {
        if (this.registeredApplication) {
            return this
        }

        this.setConfigOnResourceFields()

        await this.callPluginHook('beforeDatabaseSetup')
        await this.registerDatabase()

        await this.callPluginHook('afterDatabaseSetup')

        // Please do not change this order. Super important so bugs are not introduced.
        await this.callPluginHook('beforeMiddlewareSetup')
        this.registerAssetsRoutes()
        this.registerMiddleware()
        await this.callPluginHook('afterMiddlewareSetup')

        await this.callPluginHook('beforeCoreRoutesSetup')
        this.registerCoreRoutes()
        await this.callPluginHook('afterCoreRoutesSetup')

        await this.callPluginHook('setup')

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

        this.app.listen(port, () => {
            this.ctx.logger.success(
                `🚀 Access your server on ${
                    this.ctx.serverUrl || `http://127.0.0.1:${port}`
                }`
            )
        })
    }

    public getPluginArguments() {
        let gql: any = (text: string) => text
        try {
            gql = require('apollo-server-express').gql || gql
        } catch (e) {}

        return {
            app: this.app,
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
            storageDriver: this.storageDriver as any,
            gql,
            extendGraphQlQueries: (routes: GraphQlQueryContract[]) => {
                this.graphQlQueries(routes)
            },
            extendGraphQlTypeDefs: (
                typeDefs: TensieContext['graphQlTypeDefs']
            ) => {
                this.graphQlTypeDefs(typeDefs)
            },
            extendRoutes: (routes: RouteContract[]) => {
                this.routes(routes)
            }
        }
    }

    public async callPluginHook(hook: SetupFunctions) {
        for (let index = 0; index < this.ctx.plugins.length; index++) {
            const plugin = this.ctx.plugins[index]

            const extension = await plugin.data[hook](this.getPluginArguments())

            if (hook === 'setup') {
                this.extensions = {
                    ...this.extensions,
                    [plugin.slug]: extension
                }
            }
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

    public registerMiddleware() {
        this.app.use(BodyParser.json())

        this.app.use(responseEnhancer())

        this.app.use(CookieParser())

        this.app.disable('x-powered-by')

        const rootStorage = (this.storageConfig.disks?.local?.config as any)
            .root
        const publicPath = (this.storageConfig.disks?.local?.config as any)
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

        this.app.use(this.setAuthMiddleware)
    }

    private getApiPath = (path: string) => {
        return `/${this.ctx.apiPath}/${path}`
    }

    private getDashboardApiPath = (path: string) => {
        return `/${this.ctx.dashboardPath}/${this.ctx.apiPath}/${path}`
    }

    public authMiddleware = async (
        request: Express.Request,
        response: Express.Response,
        next: Express.NextFunction
    ) => {
        if (!request.admin) {
            return response.status(401).json({
                message: 'Unauthenticated.'
            })
        }

        next()
    }

    public setDashboardOrigin = async (
        request: Express.Request,
        response: Express.Response,
        next: Express.NextFunction
    ) => {
        request.originatedFromDashboard = true

        next()
    }

    public setAuthMiddleware = async (
        request: Express.Request,
        response: Express.Response,
        next: Express.NextFunction
    ) => {
        next()
    }

    public registerCoreRoutes() {
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

    private getMiddlewareForEndpoint(endpoint: InBuiltEndpoints) {
        return this.ctx.middleware
            .filter(middleware => middleware.type === endpoint)
            .map(middleware => middleware.handler)
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

    public asyncHandler(handler: Express.Handler) {
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

    public mail(driverName: SupportedDrivers, mailConfig = {}) {
        this.ctx.mailer = mail().connection(driverName).config(mailConfig)

        return this
    }

    public storageDriver<
        StorageDriverImplementation extends Storage,
        DriverConfig extends unknown
    >(
        driverName: SupportedStorageDrivers,
        driverConfig: DriverConfig,
        storageImplementation: StorageConstructor<StorageDriverImplementation>
    ) {
        this.storageConfig = {
            ...this.storageConfig,
            disks: {
                ...this.storageConfig.disks,
                [driverName]: {
                    driver: driverName,
                    config: driverConfig
                }
            }
        }

        this.storage = new StorageManager(this.storageConfig)

        this.storage.registerDriver<StorageDriverImplementation>(
            driverName,
            storageImplementation
        )

        return this
    }

    public defaultStorageDriver(driverName: string) {
        this.storageConfig = {
            ...this.storageConfig,
            default: driverName
        }

        this.storage = new StorageManager(this.storageConfig)

        return this
    }
}

export const tensei = () => {
    return new Tensei()
}

export default Tensei
