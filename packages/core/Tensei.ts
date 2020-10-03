import Path from 'path'
import { Signale } from 'signale'
import BodyParser from 'body-parser'
import ExpressSession from 'express-session'
import AsyncHandler from 'express-async-handler'
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
    DatabaseRepositoryInterface
} from '@tensei/common'
import MetricController from './controllers/MetricController'
import FindResourceController from './controllers/resources/FindResourceController'
import CreateResourceController from './controllers/resources/CreateResourceController'
import DeleteResourceController from './controllers/resources/DeleteResourceController'
import UpdateResourceController from './controllers/resources/UpdateResourceController'
import { StorageConstructor } from '@tensei/common'
import { SupportedStorageDrivers } from '@tensei/common'

export class Tensei {
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
    private storage: StorageManager = new StorageManager(this.storageConfig)

    private databaseRepository: DatabaseRepositoryInterface | null = null

    public config: Config = {
        databaseClient: null,
        serverUrl: '',
        clientUrl: '',
        resources: [],
        plugins: [],
        dashboards: [],
        resourcesMap: {},
        dashboardsMap: {},
        database: 'sqlite',
        pushResource: (resource: ResourceContract) => {
            this.config.resources.push(resource)
        },
        adminTable: 'administrators',
        dashboardPath: 'admin',
        apiPath: 'api',
        middleware: [],

        pushMiddleware: (middleware: EndpointMiddleware) => {
            this.config.middleware.push(middleware)
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
        env: {
            port: process.env.PORT || 1377,
            sessionSecret: process.env.SESSION_SECRET || 'test-session-secret'
        },
        logger: new Signale()
    }

    public async register() {
        if (this.registeredApplication) {
            return this
        }

        await this.callPluginHook('beforeDatabaseSetup')
        await this.registerDatabase()
        await this.callPluginHook('afterDatabaseSetup')

        // Please do not change this order. Super important so bugs are not introduced.
        await this.callPluginHook('beforeMiddlewareSetup')
        this.registerMiddleware()
        this.registerAssetsRoutes()
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
            // TODO: Make request option in manager. That way manager can be used in CLI, tests, anywhere.
            manager: this.manager({} as any)!
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

    public database(database: SupportedDatabases) {
        this.config.database = database

        return this
    }

    public databaseConfig(...allArguments: any) {
        // @ts-ignore
        this.config.databaseConfig = allArguments

        return this
    }

    public sessionSecret(secret: string) {
        this.config.env.sessionSecret = secret

        return this
    }

    public getDatabaseClient = () => {
        return this.config.databaseClient
    }

    public async registerDatabase() {
        if (this.databaseBooted) {
            return this
        }

        let Repository = null

        // if database === mysql | sqlite | pg, we'll use the @tensei/knex package, with either mysql, pg or sqlite3 package
        // We'll require('@tensei/knex') and require('sqlite3') for example. If not found, we'll install.
        if (['mysql', 'pg', 'sqlite'].includes(this.config.database)) {
            try {
                // import('@tensei/knex')
                Repository = require('@tensei/knex').Repository
            } catch (error) {
                this.config.logger.error(
                    `To use the ${this.config.database} database, you need to install @tensei/knex and ${this.config.database} packages`
                )

                process.exit(1)
            }
        }

        if (['mongodb'].includes(this.config.database)) {
            try {
                Repository = require('@tensei/mongoose').Repository
            } catch (error) {
                this.config.logger.error(
                    `To use the ${this.config.database} database, you need to install @tensei/mongoose.`
                )

                process.exit(1)
            }
        }

        const repository: DatabaseRepositoryInterface = new Repository(
            this.config.env
        )

        const client = await repository.setup(this.config)

        this.resources(repository.setResourceModels(this.config.resources))

        this.config.databaseClient = client
        this.databaseRepository = repository

        this.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                // request.db = repository

                next()
            }
        )

        this.databaseBooted = true

        return this
    }

    public apiPath(apiPath: string) {
        this.config.apiPath = apiPath

        return this
    }

    public manager = (
        request: Express.Request
    ): ManagerContract['setResource'] | null => {
        if (!this.databaseBooted) {
            return null
        }

        return new Manager(
            request,
            this.config.resources,
            this.databaseRepository!
        ).setResource
    }

    public getSessionPackage() {
        if (['mongodb'].includes(this.config.database)) {
            return 'connect-mongo'
        }

        return 'connect-session-knex'
    }

    getSessionPackageConfig(Store: any) {
        let storeArguments: any = {}

        if (['mysql', 'pg', 'sqlite3'].includes(this.config.database)) {
            storeArguments = {
                knex: this.config.databaseClient
            }
        }

        if (['mongodb'].includes(this.config.database)) {
            storeArguments = {
                mongooseConnection: require('mongoose').connection
            }
        }

        return {
            secret: this.config.env.sessionSecret,
            store: new Store(storeArguments),
            resave: false,
            saveUninitialized: false
        }
    }

    public registerMiddleware() {
        this.app.use(BodyParser.json())

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
                request.manager = this.manager(request)!
                request.mailer = this.mailer

                next()
            }
        )

        const Store = require(this.getSessionPackage())(ExpressSession)

        this.app.use(ExpressSession(this.getSessionPackageConfig(Store)))

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

        // const admin = await this.databaseRepository.findAdministratorById(request.session?.user)

        //

        let admin = await request
            .manager(this.administratorResource())
            .database()
            .findOneById(
                request.session?.user,
                [],
                [`administrator-roles.administrator-permissions`]
            )

        if (!admin) {
            return next()
        }

        if (admin.toJSON) {
            admin = admin.toJSON()
        }

        admin.permissions = admin['administrator-roles'].reduce(
            (acc: [], role: any) => [
                ...acc,
                ...(role['administrator-permissions'] || []).map(
                    (permission: any) => permission.slug
                )
            ],
            []
        )

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
            this.getApiPath(':resource/:resourceId'),
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
                request.appConfig = this.config
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

    private setValue(key: keyof Config, value: any) {
        this.config = {
            ...this.config,
            [key]: value
        }

        return this
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

    private administratorResource() {
        const Bcrypt = require('bcryptjs')

        return resource('Administrator')
            .hideFromNavigation()
            .fields([
                text('Name'),
                text('Email')
                    .unique()
                    .searchable()
                    .rules('required', 'email'),
                text('Password')
                    .hidden()
                    .rules('required', 'min:8'),
                belongsToMany('Administrator Role')
            ])
            .beforeCreate(payload => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password)
            }))
            .beforeUpdate(payload => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password)
            }))
    }

    public plugins(plugins: PluginContract[]) {
        this.config.plugins = plugins

        return this
    }

    public mail(driverName: SupportedDrivers, mailConfig = {}) {
        this.mailer = mail()
            .connection(driverName)
            .config(mailConfig)

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
