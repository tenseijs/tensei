import Path from 'path'
import { Signale } from 'signale'
import BodyParser from 'body-parser'
import ExpressSession from 'express-session'
import AsyncHandler from 'express-async-handler'
import ClientController from './controllers/ClientController'
import { mail, SupportedDrivers, Mail } from '@tensei/mail'
import AuthController from './controllers/auth/AuthController'
import ForgotPasswordController from './controllers/auth/ForgotPasswordController'
import Express, { Request, Application, NextFunction } from 'express'
import RunActionController from './controllers/actions/RunActionController'
import IndexResourceController from './controllers/resources/IndexResourceController'

import {
    text,
    Asset,
    resource,
    PluginContract,
    ResourceContract,
    SetupFunctions,
    Config,
    Manager,
    ManagerContract,
    SupportedDatabases,
    DatabaseRepositoryInterface,
    belongsToMany,
    dateTime
} from '@tensei/common'
import CreateResourceController from './controllers/resources/CreateResourceController'
import DeleteResourceController from './controllers/resources/DeleteResourceController'
import FindResourceController from './controllers/resources/FindResourceController'
import UpdateResourceController from './controllers/resources/UpdateResourceController'
import { DashboardContract } from '@tensei/common'
import MetricController from './controllers/MetricController'

export class Tensei {
    public app: Application = Express()
    public databaseClient: any = null
    public extensions: {
        [key: string]: any
    } = {}
    private pluginsBooted: boolean = false
    private databaseBooted: boolean = false
    private registeredApplication: boolean = false
    private mailer: Mail = mail().connection('ethereal')

    private supportedDatabases = ['mysql', 'pg', 'sqlite', 'mongodb']

    private databaseRepository: DatabaseRepositoryInterface | null = null

    private config: Config = {
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
            resources: this.config.resources,
            pushResource: this.config.pushResource,
            resourcesMap: this.config.resourcesMap,
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
        this.setValue('dashboardPath', dashboardPath)

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

        this.databaseClient = client
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
        this.setValue('apiPath', apiPath)

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
                knex: this.databaseClient
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
            this.getApiPath('forgot-password'),
            this.asyncHandler(ForgotPasswordController.forgotPassword)
        )

        this.app.post(
            this.getApiPath('reset-password'),
            this.asyncHandler(ForgotPasswordController.resetPassword)
        )

        this.app.post(
            this.getApiPath('logout'),
            this.authMiddleware,
            this.asyncHandler(AuthController.logout)
        )

        this.app.get(
            this.getApiPath(`resources/:resource`),
            this.authMiddleware,
            this.asyncHandler(IndexResourceController.index)
        )

        this.app.get(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.authMiddleware,
            this.asyncHandler(FindResourceController.show)
        )

        this.app.get(
            this.getApiPath(`resources/:resource/:resourceId/:relatedResource`),
            this.authMiddleware,
            this.asyncHandler(FindResourceController.showRelation)
        )

        this.app.put(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.authMiddleware,
            this.asyncHandler(UpdateResourceController.update)
        )

        this.app.get(
            this.getApiPath(`metrics/:dashboard/:metric`),
            this.authMiddleware,
            this.asyncHandler(MetricController.index)
        )

        this.app.patch(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.authMiddleware,
            this.asyncHandler(UpdateResourceController.update)
        )

        this.app.post(
            this.getApiPath(`resources/:resource`),
            this.authMiddleware,
            this.asyncHandler(CreateResourceController.store)
        )

        this.app.post(
            this.getApiPath(`resources/:resource/actions/:action`),
            this.authMiddleware,
            this.asyncHandler(RunActionController.run)
        )

        this.app.delete(
            this.getApiPath(`resources/:resource/:resourceId`),
            this.authMiddleware,
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

        this.setValue('resources', uniqueResources)

        const resourcesMap: Config['resourcesMap'] = {}

        uniqueResources.forEach(resource => {
            resourcesMap[resource.data.slug] = resource
        })

        this.setValue('resourcesMap', resourcesMap)

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
}

export const tensei = (config = {}) => {
    return new Tensei()
}

export default Tensei
