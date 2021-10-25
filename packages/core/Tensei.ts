import pino from 'pino'
import Emittery from 'emittery'
import BodyParser from 'body-parser'
import * as indicative from 'indicative'
import CookieParser from 'cookie-parser'
import { createServer, Server } from 'http'
import Express, { Application } from 'express'
import { mail, MailConfig } from '@tensei/mail'
import AsyncHandler from 'express-async-handler'
import { responseEnhancer } from 'express-response-formatter'
import { StorageManager, Storage } from '@slynova/flydrive'

import {
  Asset,
  Config,
  RouteContract,
  PluginContract,
  ResourceContract,
  SetupFunctions,
  DashboardContract,
  StorageConstructor,
  SupportedStorageDrivers,
  ExtendMailCallback,
  EventContract,
  DataPayload,
  ApiContext,
  CommandContract,
  command
} from '@tensei/common'
import Database from './database'
import {
  TenseiContract,
  DatabaseConfiguration,
  TenseiContext,
  GraphQlQueryContract,
  PluginSetupConfig,
  PluginSetupFunction,
  TENSEI_MODE
} from '@tensei/common'

export enum TENSEI_MODES {
  cli = 'cli',
  serverless = 'serverless',
  default = 'default'
}

export class Tensei implements TenseiContract {
  public orm: any = null
  public mode: TENSEI_MODE =
    (process.env.TENSEI_MODE as TENSEI_MODE) || TENSEI_MODES.default
  public app: Application = Express()
  public server: Server = createServer(this.app)
  public extensions: {
    [key: string]: any
  } = {}
  private databaseBooted: boolean = false
  private registeredApplication: boolean = false

  private mailerConfig: MailConfig = {
    mailers: {
      fake: {
        driver: 'fake'
      }
    },
    mailer: 'fake' as never
  }

  public ctx: Config = {} as any

  public constructor() {
    this.initCtx()
  }

  private initCtx() {
    this.ctx = {
      port: process.env.PORT || 8810,
      serverHost: process.env.HOST || '127.0.0.1',
      schemas: [],
      routes: [],
      events: {},
      commands: [],
      migrating: false,
      root: process.cwd(),
      emitter: new Emittery(),
      name: process.env.APP_NAME || 'Tensei',
      graphQlQueries: [],
      graphQlTypeDefs: [],
      graphQlMiddleware: [],
      rootBoot: () => {},
      rootRegister: () => {},
      storageConfig: {
        default: 'local',
        disks: {
          local: {
            driver: 'local',
            config: {
              root: `${this.ctx.root}/storage`,
              publicPath: ``
            }
          }
        }
      },
      databaseClient: null,
      clientUrl: '',
      resources: [],
      plugins: [],
      dashboards: [],
      resourcesMap: {},
      dashboardsMap: {},
      orm: null,
      db: null,
      repositories: {},
      scripts: [],
      styles: [],
      logger: pino({
        prettyPrint:
          process.env.NODE_ENV !== 'production'
            ? {
                ignore: 'pid,hostname,time'
              }
            : false
      }),
      indicative,
      graphQlExtensions: [],
      extendGraphQlMiddleware: (...middleware: any[]) => {
        this.ctx.graphQlMiddleware = [
          ...this.ctx.graphQlMiddleware,
          ...middleware
        ]
      },
      extendResources: (resources: ResourceContract[]) => {
        this.resources(resources)
      },
      pluginsConfig: {}
    } as any

    this.ctx.serverUrl =
      process.env.SERVER_URL || `http://${this.ctx.serverHost}:${this.ctx.port}`

    this.ctx.mailer = mail(this.mailerConfig, this.ctx.logger, this.ctx.root)

    this.ctx.databaseConfig = {
      type: (process.env.DATABASE_TYPE as any) || 'sqlite',
      entities: [],
      clientUrl: process.env.DATABASE_URL,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      dbName: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT
        ? parseInt(process.env.DATABASE_PORT)
        : undefined,
      host: process.env.DATABASE_HOST,
      charset: process.env.DATABASE_CHARSET,
      forceUtcTimezone:
        process.env.FORCE_UTC_TIMEZONE === undefined
          ? true
          : process.env.FORCE_UTC_TIMEZONE === 'true'
    }

    if (this.ctx.databaseConfig.type === 'sqlite') {
      this.ctx.databaseConfig.dbName =
        process.env.DATABASE_NAME || `${this.ctx.name}.sqlite`.toLowerCase()
    }

    if (
      this.ctx.databaseConfig.type === 'postgresql' &&
      process.env.NODE_ENV === 'production'
    ) {
      // Add client configurations that facilitate heroku postgres by default.
      this.ctx.databaseConfig.driverOptions = {
        connection: {
          ssl: {
            rejectUnauthorized: false
          }
        }
      }
    }

    this.ctx.storage = new StorageManager({
      default: 'local',
      disks: {
        local: {
          driver: 'local',
          config: {
            root: `${this.ctx.root}/storage`,
            publicPath: ``
          }
        }
      }
    })
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
    this.ctx.graphQlQueries = [...this.ctx.graphQlQueries, ...graphQlQueries]

    return this
  }

  public graphQlTypeDefs(graphQlTypeDefs: TenseiContext['graphQlTypeDefs']) {
    this.ctx.graphQlTypeDefs = [...this.ctx.graphQlTypeDefs, ...graphQlTypeDefs]

    return this
  }

  private forceMiddleware() {
    this.app.use((request, response, next) => {
      request.req = request
      request.res = response

      return next()
    })

    this.app.use((request, response, next) => {
      request.authenticationError = (message: string = 'Unauthenticated.') => ({
        status: 401,
        message
      })

      request.forbiddenError = (message: string = 'Forbidden.') => ({
        status: 400,
        message
      })

      request.validationError = (message: string = 'Validation failed.') => ({
        status: 422,
        message
      })

      request.userInputError = (
        message: string = 'Validation failed.',
        properties: any
      ) => ({
        status: 422,
        message,
        ...properties
      })

      return next()
    })
  }

  private registerCoreCommands(orm: any) {
    this.commands([
      command('orm:types')
        .describe(
          'Generate types for the orm. This will generate types such as Model and Repository for all your resources.'
        )
        .run(function () {
          orm.generateTypes()

          this.logger.success('Orm types generated successfully.')
        })
    ])
  }

  private async bootApplication() {
    if (this.registeredApplication) {
      return this
    }

    this.forceMiddleware()

    await this.callPluginHook('register')

    await this.ctx.rootRegister(this.getPluginArguments())

    this.setConfigOnResourceFields()

    await this.registerDatabase()

    const Orm = require('@tensei/orm').Orm
    const orm = new Orm(this.ctx)

    this.ctx.db = orm.generate()
    this.ctx.repositories = this.ctx.db

    this.registerCoreCommands(orm)

    this.registerAssetsRoutes()
    this.registerMiddleware()

    await this.callPluginHook('boot')
    await this.ctx.rootBoot(this.getPluginArguments())

    this.registerRoutes()

    this.registerEmitteryListeners()

    this.registerAsyncErrorHandler()

    this.registeredApplication = true

    this.ctx.emitter.emit('tensei::booted')

    return this
  }

  private authorizeResolver = async (ctx: ApiContext, query: RouteContract) => {
    const authorized = await Promise.all(
      query.config.authorize.map(fn => fn(ctx as any, ctx.entity))
    )

    if (
      authorized.filter(result => result).length !==
      query.config.authorize.length
    ) {
      throw ctx.forbiddenError('Unauthorized.')
    }
  }

  private registerRoutes() {
    this.ctx.routes.forEach(route => {
      const path = route.config.path.startsWith('/')
        ? route.config.path
        : `/${route.config.path}`
      ;(this.app as any)[route.config.type.toLowerCase()](
        path,

        ...route.config.middleware.map(fn => AsyncHandler(fn)),
        AsyncHandler(
          async (
            request: Express.Request,
            response: Express.Response,
            next: Express.NextFunction
          ) => {
            await this.authorizeResolver(request as any, route)

            return next()
          }
        ),
        AsyncHandler(
          async (request: Express.Request, response: Express.Response) =>
            route.config.handler(request, response)
        )
      )
    })
  }

  private registerEmitteryListeners() {
    Object.keys(this.ctx.events).forEach(eventName => {
      const event = this.ctx.events[eventName]

      event.config.listeners.forEach(listener => {
        this.ctx.emitter.on(eventName as any, data => {
          try {
            listener(data as any)
          } catch (error) {
            this.ctx.logger.error(error)
          }
        })
      })
    })

    const originalEmit = this.ctx.emitter.emit.bind(this.ctx.emitter)

    this.ctx.emitter.emit = async (eventName: string, data: any) => {
      return originalEmit(eventName, {
        payload: data,
        ctx: this.ctx
      })
    }
  }

  public async migrate() {
    this.ctx.migrating = true

    await this.bootApplication()
  }

  public async shutdown() {
    // Shutdown database
    if (this.ctx.orm) {
      await this.ctx.orm.close()
    }

    return this
  }

  public async start(fn?: (ctx: Config) => any, listen = true) {
    if (!this.registeredApplication) {
      await this.bootApplication()
    }

    if (this.mode !== TENSEI_MODES.default) {
      return this
    }

    if (fn) {
      const callback = fn(this.ctx)

      if (callback instanceof Promise) {
        fn(this.ctx).then(() => {
          listen && this.listen()
        })
      } else {
        listen && this.listen()
      }

      return this
    }

    listen && this.listen()

    return this
  }

  public name(name: string) {
    this.ctx.name = name

    return this
  }

  public async listen() {
    if (!this.registeredApplication) {
      await this.bootApplication()
    }

    return this.server.listen(this.ctx.port, () => {
      this.ctx.emitter.emit('tensei::listening')
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
      script: (
        name: Asset['name'],
        path: Asset['path'],
        chunk?: Asset['chunk']
      ) => {
        this.ctx.scripts = [
          ...this.ctx.scripts,
          {
            name,
            path,
            chunk
          }
        ]
      },
      manager: this.ctx.orm ? this.ctx.orm.em.fork() : null,
      gql,
      extendGraphQlQueries: (routes: GraphQlQueryContract[]) => {
        this.graphQlQueries(routes)
      },
      extendGraphQlTypeDefs: (typeDefs: TenseiContext['graphQlTypeDefs']) => {
        this.graphQlTypeDefs(typeDefs)
      },
      extendRoutes: (routes: RouteContract[]) => {
        this.routes(routes)
      },
      extendCommands: (commands: CommandContract[]) => {
        this.commands(commands)
      },
      setPluginConfig: (name: string, config: any) => {
        this.ctx.pluginsConfig[name] = config
      },
      inProduction: process.env.NODE_ENV === 'production',
      currentCtx: () => this.ctx,
      storageDriver: this.storageDriver.bind(this),
      getQuery: this.getQuery.bind(this),
      getRoute: this.getRoute.bind(this),
      extendMailer: this.extendMailer.bind(this),
      extendEvents: this.events.bind(this),
      extendPlugins: this.plugins.bind(this)
    }
  }

  public mailer(driver: string) {
    this.mailerConfig.mailer = (driver as unknown) as never

    return this
  }

  private extendMailer(
    name: string,
    driver: ExtendMailCallback,
    config?: MailConfig['mailers']
  ) {
    this.mailerConfig = {
      ...this.mailerConfig,
      mailers: {
        ...this.mailerConfig.mailers,
        [name]: {
          ...(config || {}),
          driver: name
        }
      }
    }

    this.ctx.mailer = mail(this.mailerConfig, this.ctx.logger, this.ctx.root)

    this.ctx.mailer.extend(name, driver)
  }

  private getQuery(path: string) {
    return this.ctx.graphQlQueries.find(query => query.config.path === path)
  }

  private getRoute(idOrPath: string) {
    return this.ctx.routes.find(
      route => route.config.id === idOrPath || route.config.path === idOrPath
    )
  }

  private async callPluginHook(
    hook: SetupFunctions,
    plugins = this.ctx.plugins
  ) {
    for (let index = 0; index < plugins.length; index++) {
      const plugin = plugins[index]

      await plugin.config[hook](this.getPluginArguments())
    }

    return this
  }

  public db(databaseConfig: DatabaseConfiguration) {
    this.ctx.databaseConfig = databaseConfig

    return this
  }

  public databaseConfig(databaseConfig: DatabaseConfiguration) {
    this.ctx.databaseConfig = {
      ...this.ctx.databaseConfig,
      ...databaseConfig
    }

    return this
  }

  private async bootDatabase() {
    const [orm, schemas] = await new Database(this.ctx).init()

    this.ctx.orm = orm
    this.ctx.schemas = schemas
  }

  private async registerDatabase() {
    if (this.databaseBooted) {
      return this
    }

    await this.bootDatabase()

    this.databaseBooted = true

    return this
  }

  public registerMiddleware() {
    this.app.use(BodyParser.json())

    this.app.use(responseEnhancer())

    this.app.use(CookieParser())

    this.app.disable('x-powered-by')

    if (this.ctx.storageConfig.default === 'local') {
      const rootStorage = (this.ctx.storageConfig.disks?.local?.config as any)
        .root
      const publicPath = (this.ctx.storageConfig.disks?.local?.config as any)
        .publicPath

      this.app.use(Express.static(`${rootStorage}`))
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
        request.currentCtx = () => this.ctx
        request.mailer = this.ctx.mailer
        request.config = this.ctx
        request.logger = this.ctx.logger
        request.storage = this.ctx.storage
        request.emitter = this.ctx.emitter
        request.indicative = indicative
        request.repositories = this.ctx.repositories

        // @ts-ignore
        this.ctx.request = request

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
        const payload: any = {
          message: error.message || 'Internal server error.'
        }

        if (error.errors) {
          payload.errors = error.errors
        }

        this.ctx.logger.error(error)

        return response.status(error.status || 500).json(payload)
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
        updatedResources.find(resource => resource.data.name === resourceName)
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
    this.ctx.plugins = [...this.ctx.plugins, ...plugins]

    return this
  }

  public commands(commands: CommandContract[]) {
    this.ctx.commands = [...this.ctx.commands, ...commands]

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

  public boot(boot: PluginSetupFunction) {
    this.ctx.rootBoot = boot

    return this
  }

  public register(setup: PluginSetupFunction) {
    this.ctx.rootRegister = setup

    return this
  }

  public events(events: EventContract<DataPayload>[]) {
    events.forEach(event => {
      const eventExists = this.ctx.events[event.config.name]

      this.ctx.events[event.config.name] = {
        ...event,
        config: {
          ...event.config,
          listeners: [
            ...event.config.listeners,
            ...(eventExists ? eventExists.config.listeners : [])
          ]
        }
      }
    })

    return this
  }

  public root(root: string) {
    this.ctx.root = root

    this.initCtx()

    return this
  }
}

export const tensei = () => new Tensei()

export default Tensei
