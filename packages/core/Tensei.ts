import Path from 'path'
import { Signale } from 'signale'
import BodyParser from 'body-parser'
import { responseEnhancer } from 'express-response-formatter'
import { MikroORM, ConnectionOptions, RequestContext } from '@mikro-orm/core'
import ExpressSession from 'express-session'
import AsyncHandler from 'express-async-handler'
import { validator, sanitizer } from 'indicative'
import ClientController from './controllers/ClientController'
import { mail, SupportedDrivers, Mail } from '@tensei/mail'
import {
    StorageManager,
    Storage,
    StorageManagerConfig
} from '@slynova/flydrive'
import AuthController from './controllers/auth/AuthController'
import ForgotPasswordController from './controllers/auth/ForgotPasswordController'
import Express, { Request, Application, NextFunction } from 'express'
import RunActionController from './controllers/actions/RunActionController'
import IndexResourceController from './controllers/resources/IndexResourceController'

import {
    text,
    Asset,
    Config,
    Manager,
    resource,
    belongsToMany,
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
import MetricController from './controllers/MetricController'
import FindResourceController from './controllers/resources/FindResourceController'
import CreateResourceController from './controllers/resources/CreateResourceController'
import DeleteResourceController from './controllers/resources/DeleteResourceController'
import UpdateResourceController from './controllers/resources/UpdateResourceController'
import { TenseiContract, DatabaseConfiguration } from '@tensei/core'

export class Tensei implements TenseiContract {
    public app: Application = Express()
    public extensions: {
        [key: string]: any
    } = {}
    private databaseBooted: boolean = false
    private registeredApplication: boolean = false
    public mailer: Mail = mail().connection('ethereal')
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

    private databaseRepository: DatabaseRepositoryInterface | null = null

    public config: Config = {
        schemas: [],
        databaseClient: null,
        serverUrl: '',
        clientUrl: '',
        resources: [],
        plugins: [],
        dashboards: [],
        resourcesMap: {},
        dashboardsMap: {},
        pushResource: (resource: ResourceContract) => {
            this.config.resources = [...this.config.resources, resource]
        },
        adminTable: 'administrators',
        dashboardPath: 'admin',
        apiPath: 'api',
        middleware: [],

        pushMiddleware: (middleware: EndpointMiddleware) => {
            this.config.middleware = [...this.config.middleware, middleware]
        },
        orm: null,
        databaseConfig: {
            type: 'sqlite'
        },
        showController: this.asyncHandler(FindResourceController.show),
        runActionController: this.asyncHandler(RunActionController.run),
        indexController: this.asyncHandler(IndexResourceController.index),
        createController: this.asyncHandler(CreateResourceController.store),
        updateController: this.asyncHandler(UpdateResourceController.update),
        deleteController: this.asyncHandler(DeleteResourceController.destroy),
        showRelationController: this.asyncHandler(
            FindResourceController.showRelation
        ),
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
        }
    }

    public setConfigOnResourceFields() {
        this.config.resources.forEach(resource => {
            resource.data.fields.forEach(field => {
                field.tenseiConfig = this.config

                field.afterConfigSet()
            })
        })
    }

    public async register() {
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

        this.registeredApplication = true

        return this
    }

    public getPluginArguments() {
        return {
            app: this.app,
            ...this.config,
            style: (name: Asset['name'], path: Asset['path']) => {
                this.config.styles = [
                    ...this.config.styles,
                    {
                        name,
                        path
                    }
                ]
            },
            script: (name: Asset['name'], path: Asset['path']) => {
                this.config.scripts = [
                    ...this.config.scripts,
                    {
                        name,
                        path
                    }
                ]
            },
            manager: this.config.orm ? this.config.orm.em : null,
            storageDriver: this.storageDriver as any
        }
    }

    public async callPluginHook(hook: SetupFunctions) {
        for (let index = 0; index < this.config.plugins.length; index++) {
            const plugin = this.config.plugins[index]

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
        this.config.dashboardPath = dashboardPath

        return this
    }

    public databaseConfig(databaseConfig: DatabaseConfiguration) {
        this.config.databaseConfig = databaseConfig

        return this
    }

    public getDatabaseClient = () => {
        return this.config.databaseClient
    }

    private async bootDatabase() {
        const [orm, schemas] = await new Database(this.config).init()

        this.config.orm = orm
        this.config.schemas = schemas
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
        this.config.apiPath = apiPath

        return this
    }

    public getSessionPackage() {
        if (['mongodb'].includes(this.config.databaseConfig.type)) {
            return 'connect-mongo'
        }

        return 'connect-session-knex'
    }

    getSessionPackageConfig(Store: any) {
        let storeArguments: any = {}

        if (
            ['mysql', 'pg', 'sqlite3', 'sqlite'].includes(
                this.config.databaseConfig.type
            )
        ) {
            storeArguments = {
                knex: this.config.databaseClient
            }
        }

        if (['mongodb'].includes(this.config.databaseConfig.type)) {
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
                request.dashboards = this.config.dashboardsMap
                request.resources = this.config.resourcesMap
                request.mailer = this.mailer
                request.config = this.config

                next()
            }
        )

        this.app.use((request, response, next) =>
            RequestContext.create(this.config.orm?.em!, next)
        )
        this.app.use((request, response, next) => {
            request.manager = RequestContext.getEntityManager()!

            next()
        })

        this.app.use(this.setAuthMiddleware)
    }

    private getApiPath = (path: string) => {
        return `/${this.config.apiPath}/${path}`
    }

    private getDashboardApiPath = (path: string) => {
        return `/${this.config.dashboardPath}/${this.config.apiPath}/${path}`
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
        if (!request.session?.user) {
            return next()
        }

        let admin = await request
            .manager('Administrator')
            .database()
            .getAdministratorById(request.session?.user!)

        if (!admin) {
            return next()
        }

        request.admin = admin

        next()
    }

    public registerCoreRoutes() {
        // The administration dashboard

        this.app.post(
            this.getDashboardApiPath('login'),
            this.setDashboardOrigin,
            this.asyncHandler(AuthController.login)
        )

        this.app.post(
            this.getDashboardApiPath('register'),
            this.setDashboardOrigin,
            this.asyncHandler(AuthController.register)
        )

        this.app.post(
            this.getDashboardApiPath('forgot-password'),
            this.setDashboardOrigin,
            this.asyncHandler(ForgotPasswordController.forgotPassword)
        )

        this.app.post(
            this.getDashboardApiPath('reset-password'),
            this.setDashboardOrigin,
            this.asyncHandler(ForgotPasswordController.resetPassword)
        )

        this.app.post(
            this.getDashboardApiPath('logout'),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.asyncHandler(AuthController.logout)
        )

        this.app.get(
            this.getDashboardApiPath(`resources/:resource`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.indexController
        )

        this.app.get(
            this.getDashboardApiPath(`resources/:resource/:resourceId`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.showController
        )

        this.app.get(
            this.getDashboardApiPath(
                `resources/:resource/:resourceId/:relatedResource`
            ),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.showRelationController
        )

        this.app.put(
            this.getDashboardApiPath(`resources/:resource/:resourceId`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.updateController
        )

        this.app.get(
            this.getDashboardApiPath(`metrics/:dashboard/:metric`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.asyncHandler(MetricController.index)
        )

        this.app.patch(
            this.getDashboardApiPath(`resources/:resource/:resourceId`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.updateController
        )

        this.app.post(
            this.getDashboardApiPath(`resources/:resource`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.createController
        )

        this.app.post(
            this.getDashboardApiPath(`resources/:resource/actions/:action`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.runActionController
        )

        this.app.delete(
            this.getDashboardApiPath(`resources/:resource/:resourceId`),
            this.setDashboardOrigin,
            this.authMiddleware,
            this.config.deleteController
        )

        this.app.get(
            `/${this.config.dashboardPath}(/*)?`,
            this.asyncHandler(ClientController.index)
        )

        this.generateClientFacingApiRoutes()

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

                console.error(error)

                response.status(500).json({
                    message: 'Internal server error.',
                    error
                })
            }
        )
    }

    public generateClientFacingApiRoutes() {
        this.app.get(
            this.getApiPath(':resource'),
            ...this.getMiddlewareForEndpoint('index'),
            this.config.indexController
        )

        this.app.get(
            this.getApiPath(':resource/:resourceId'),
            ...this.getMiddlewareForEndpoint('show'),
            this.config.showController
        )

        this.app.get(
            this.getApiPath(':resource/:resourceId/:relatedResource'),
            ...this.getMiddlewareForEndpoint('showRelation'),
            this.config.showRelationController
        )

        this.app.post(
            this.getApiPath(':resource'),
            ...this.getMiddlewareForEndpoint('create'),
            this.config.createController
        )

        this.app.put(
            this.getApiPath(':resource/:resourceId'),
            ...this.getMiddlewareForEndpoint('update'),
            this.config.updateController
        )

        this.app.patch(
            this.getApiPath(':resource/:resourceId'),
            ...this.getMiddlewareForEndpoint('update'),
            this.config.updateController
        )

        this.app.delete(
            this.getApiPath(':resource/:resourceId'),
            ...this.getMiddlewareForEndpoint('delete'),
            this.config.deleteController
        )
    }

    public serverUrl(url: string) {
        this.config.serverUrl = url

        return this
    }

    public clientUrl(url: string) {
        this.config.clientUrl = url

        return this
    }

    private getMiddlewareForEndpoint(endpoint: InBuiltEndpoints) {
        return this.config.middleware
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
                request.config = this.config
                request.scripts = this.config.scripts
                request.styles = this.config.styles

                next()
            }
        )

        this.config.scripts.concat(this.config.styles).forEach(asset => {
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
        const updatedResources = [...this.config.resources, ...resources]

        const uniqueResources = Array.from(
            new Set(updatedResources.map(resource => resource.data.name))
        )
            .map(resourceName =>
                updatedResources.find(
                    resource => resource.data.name === resourceName
                )
            )
            .filter(Boolean) as ResourceContract[]

        this.config.resources = uniqueResources

        const resourcesMap: Config['resourcesMap'] = {}

        uniqueResources.forEach(resource => {
            resourcesMap[resource.data.slug] = resource
            resourcesMap[resource.data.pascalCaseName] = resource
        })

        this.config.resourcesMap = resourcesMap

        return this
    }

    public dashboards(dashboards: DashboardContract[]) {
        const updatedDashboards = [...this.config.dashboards, ...dashboards]

        this.config.dashboards = Array.from(
            new Set(updatedDashboards.map(dashboard => dashboard.config.name))
        )
            .map(resourceName =>
                updatedDashboards.find(
                    dashboard => dashboard.config.name === resourceName
                )
            )
            .filter(Boolean) as DashboardContract[]

        this.config.dashboards.forEach(dashboard => {
            this.config.dashboardsMap[dashboard.config.slug] = dashboard
        })

        return this
    }

    public plugins(plugins: PluginContract[]) {
        this.config.plugins = plugins

        return this
    }

    public mail(driverName: SupportedDrivers, mailConfig = {}) {
        this.mailer = mail().connection(driverName).config(mailConfig)

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
