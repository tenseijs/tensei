import Fs from 'fs'
import Path from 'path'
import Csurf from 'csurf'
import crypto from 'crypto'
import Mustache from 'mustache'
import Passport from 'passport'
import Bcrypt from 'bcryptjs'
import CookieParser from 'cookie-parser'
import PassportLocal from 'passport-local'
import AsyncHandler from 'express-async-handler'
import { Router, RequestHandler, static as Static, Request } from 'express'
import { responseEnhancer } from 'express-response-formatter'
import ExpressSession, { CookieOptions } from 'express-session'
import ExpressSessionMikroORMStore, {
  generateSessionEntity
} from 'express-session-mikro-orm'
import {
  Utils,
  route,
  plugin,
  Asset,
  resource,
  text,
  event,
  boolean,
  belongsToMany,
  dateTime,
  select,
  Config,
  User,
  belongsTo,
  ApiContext,
  RouteContract,
  DashboardContract
} from '@tensei/common'
import getRoutes from './routes'
import { setupCms } from './setup'
import { DataPayload } from '@tensei/common/config'

const indexFileContent = Fs.readFileSync(
  Path.resolve(__dirname, 'template', 'index.mustache')
).toString()

class CmsPlugin {
  private scripts: Asset[] = [
    {
      name: 'manifest.js',
      path: Path.resolve(__dirname, 'public', 'manifest.js')
    },
    {
      name: 'vendor.js',
      path: Path.resolve(__dirname, 'public', 'vendor.js')
    },
    {
      name: 'main.js',
      path: Path.resolve(__dirname, 'public', 'main.js')
    }
  ]

  private config: {
    path: string
    apiPath: string
    setup: () => any
    cookieOptions: {}
    userResource: string
    permissionResource: string
    tokenResource: string
    roleResource: string
    dashboards: DashboardContract[]
  } = {
    path: 'cms',
    apiPath: 'cms/api',
    setup: () => {},
    cookieOptions: {},
    dashboards: [],
    userResource: 'Admin User',
    permissionResource: 'Admin Permission',
    roleResource: 'Admin Role',
    tokenResource: 'Admin Token'
  }

  private router = Router()

  cookies(cookieOptions: CookieOptions) {
    this.config.cookieOptions = cookieOptions

    return this
  }

  private styles: Asset[] = [
    {
      name: 'tensei.css',
      path: Path.resolve(__dirname, 'public', 'styles.css')
    }
    // {
    //     name: 'main.css',
    //     path: Path.resolve(__dirname, 'public', 'main.css')
    // }
  ]

  path(path: string) {
    this.config.path = path
    this.config.apiPath = `/${path}/api`

    return this
  }

  private getApiPath = (path: string) => {
    return `/api/${path}`
  }

  private resources = {
    user: this.userResource(),
    role: this.roleResource(),
    token: this.tokenResource(),
    permission: this.permissionResource()
  }

  public generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex')
  }

  private routes = () => [
    route('Get CMS Csrf Token')
      .get()
      .path(this.getApiPath('csrf'))
      .handle((request, response) => {
        response.cookie('x-csrf-token', request.csrfToken())

        return response.status(204).json()
      }),
    route('Passwordless Logout')
      .path(this.getApiPath('logout'))
      .id('passwordless_logout')
      .post()
      .handle(async (request, response) => {
        request.session.destroy(error => {
          if (error) {
            return response.status(204).json()
          }

          response.clearCookie('connect.sid')

          return response.status(204).json()
        })
      })
  ]

  private loginPassport = async (request: Request, done: any) => {
    const { config, manager, body } = request

    const { indicative } = config

    try {
      const { email, password } = await indicative.validator.validate(body, {
        email: 'required|email'
      })

      let user: any = await manager.findOne(
        this.resources.user.data.pascalCaseName,
        {
          email
        }
      )

      if (!user) {
        return done(
          [
            {
              field: 'email',
              message: 'This user does not exist.'
            }
          ],
          null
        )
      }

      if (!Bcrypt.compareSync(password, user.password)) {
        return done(
          [
            {
              field: 'password',
              message: 'Your password is incorrect.'
            }
          ],
          null
        )
      }

      return done(null, user)
    } catch (errors) {
      return done(errors, null)
    }
  }

  private registerPassport = async (request: Request, done: any) => {
    const { config, manager, body, resources } = request
    const { emitter } = config

    const adminCount = await manager.count(
      this.resources.user.data.pascalCaseName,
      {}
    )

    if (adminCount !== 0) {
      return done(
        {
          message: 'Admin user already exists.'
        },
        null
      )
    }

    const validator = Utils.validator(this.userResource(), manager, resources)

    const [success, payload] = await validator.validate(body)

    if (!success) {
      return done(payload, null)
    }

    let createUserPayload: any = {
      ...payload,
      active: true
    }

    const admin: User = manager.create(
      this.resources.user.data.pascalCaseName,
      createUserPayload
    )

    await manager.persistAndFlush(admin)

    emitter.emit('ADMIN_REGISTERED', admin)

    return done(null, admin)
  }

  private permissionResource() {
    return resource(this.config.permissionResource)
      .fields([
        text('Name').searchable().rules('required'),
        text('Slug').rules('required').unique().searchable().rules('required'),
        belongsToMany(this.config.roleResource)
      ])
      .displayField('Name')
      .hideOnApi()
      .hideFromNavigation()
  }

  private tokenResource() {
    return resource(this.config.tokenResource)
      .fields([
        select('Type').options([
          {
            label: 'Passwordless',
            value: 'PASSWORDLESS'
          }
        ]),
        text('Token'),
        dateTime('Expires At').nullable(),
        belongsTo(this.config.userResource)
      ])
      .hideFromNavigation()
      .hideOnApi()
  }

  private roleResource() {
    return resource(this.config.roleResource)
      .fields([
        text('Name')
          .rules('required')
          .unique()
          .searchable()
          .sortable()
          .rules('required'),
        text('Slug')
          .rules('required', 'unique:slug')
          .unique()
          .sortable()
          .searchable()
          .rules('required'),
        text('Description').nullable().rules('max:255'),
        belongsToMany(this.config.userResource),
        belongsToMany(this.config.permissionResource).owner()
      ])
      .hideOnApi()
      .displayField('Name')
      .hideFromNavigation()
  }

  private userResource() {
    return resource(this.config.userResource)
      .fields([
        text('Full name').searchable().nullable().sortable(),
        text('Password').rules('required', 'min:12').nullable(),
        text('Email')
          .unique()
          .searchable()
          .sortable()
          .notNullable()
          .rules('required', 'email', 'unique:email'),
        boolean('Active')
          .nullable()
          .sortable()
          .defaultFormValue(true)
          .default(true)
          .rules('boolean'),
        belongsToMany(this.config.roleResource).rules('array')
      ])
      .displayField('Full name')
      .secondaryDisplayField('Email')
      .hideOnApi()
      .hideFromNavigation()
      .beforeCreate(({ entity, em }) => {
        const payload: DataPayload = {
          password: entity.password
            ? Bcrypt.hashSync(entity.password)
            : undefined
        }

        em.assign(entity, payload)
      })
      .beforeUpdate(async ({ entity, em, changeSet }) => {
        if (changeSet?.payload.password) {
          em.assign(entity, {
            password: Bcrypt.hashSync(changeSet.payload.password)
          })
        }
      })
  }

  sessionMikroOrmOptions = {
    entityName: `${this.resources.user.data.pascalCaseName}Session`,
    tableName: `${this.resources.user.data.camelCaseNamePlural}_sessions`,
    collection: `${this.resources.user.data.camelCaseNamePlural}_sessions`
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

  private getRolesAndPermissionsNames() {
    return `${this.resources.role.data.camelCaseNamePlural}.${this.resources.permission.data.camelCaseNamePlural}`
  }

  private getRoleUserKey() {
    return this.resources.role.data.camelCaseNamePlural
  }

  private getPermissionUserKey() {
    return this.resources.permission.data.camelCaseNamePlural
  }

  public dashboards(dashboards: DashboardContract[]) {
    this.config.dashboards = [...this.config.dashboards, ...dashboards]

    return this
  }

  private setAuth: RequestHandler = async (request, response, next) => {
    const { manager, session } = request

    try {
      const user: any = await manager.findOne(
        this.resources.user.data.pascalCaseName,
        {
          // @ts-ignore
          id: session.user?.id
        },
        {
          populate: [this.getRolesAndPermissionsNames()]
        }
      )

      if (user) {
        user[this.resources.permission.data.camelCaseNamePlural] = user[
          this.getRoleUserKey()
        ]
          ?.toJSON()
          .reduce(
            (acc: string[], role: any) => [
              ...acc,
              ...(role as any)[this.getPermissionUserKey()].map(
                (p: any) => p.slug
              )
            ],
            []
          )
      }

      // @ts-ignore
      request.user = user
    } catch (error) {}

    next()
  }

  plugin() {
    return plugin('CMS')
      .id('cms')
      .register(({ script, style, extendResources, databaseConfig }) => {
        this.scripts.forEach(s => script(s.name, s.path))
        this.styles.forEach(s => style(s.name, s.path))

        databaseConfig.entities = [
          ...(databaseConfig.entities || []),
          generateSessionEntity(this.sessionMikroOrmOptions)
        ]

        extendResources([
          this.resources.user,
          this.resources.role,
          this.resources.token,
          this.resources.permission
        ])
      })
      .boot(async config => {
        const { app, orm, extendEvents, resources, currentCtx } = config
        const Store = ExpressSessionMikroORMStore(
          ExpressSession,
          this.sessionMikroOrmOptions
        )

        await setupCms(config, [this.resources.role, this.resources.permission])

        this.router.use(CookieParser())

        this.router.use(
          ExpressSession({
            resave: false,
            saveUninitialized: false,
            store: new Store({ orm }) as any,
            cookie: this.config.cookieOptions,
            secret: process.env.SESSION_SECRET || '__sessions__secret__'
          })
        )

        this.router.use(Passport.initialize())
        this.router.use(Passport.session())

        const self = this

        Passport.use(
          'local-register',
          new PassportLocal.Strategy(
            {
              usernameField: 'email',
              passwordField: 'password',
              passReqToCallback: true
            },
            async (request, email, password, done) => {
              await self.registerPassport(request, done)
            }
          )
        )

        Passport.use(
          'local-login',
          new PassportLocal.Strategy(
            {
              usernameField: 'email',
              passwordField: 'password',
              passReqToCallback: true
            },
            async (request, email, password, done) => {
              await this.loginPassport(request, done)
            }
          )
        )

        Passport.serializeUser((user, done) => {
          done(null, {
            id: (user as any).id
          })
        })
        Passport.deserializeUser(async (request, id, done) => {
          const user = await request.manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
              id: id.id
            }
          )

          done(null, user)
        })
        this.router.post(
          `${this.getApiPath('auth/register')}`,
          (request, response, next) => {
            Passport.authenticate(
              'local-register',
              {
                successRedirect: `${this.getApiPath('')}`,
                failureRedirect: `${this.getApiPath('auth/register')}`
              },
              (error, user, info) => {
                if (user === false) {
                  return response.status(422).json([
                    {
                      message: 'The full name is required.',
                      field: 'fullName'
                    },
                    {
                      message: 'The email is required.',
                      field: 'email'
                    },
                    {
                      message: 'The password is required.',
                      field: 'password'
                    }
                  ])
                }

                if (error || !user) {
                  return response.status(400).json(error)
                }

                request.logIn(user, error => {
                  if (error) {
                    return next(error)
                  }

                  return response.status(204).json([])
                })
              }
            )(request, response, next)
          }
        )

        this.router.post(
          `${this.getApiPath('auth/login')}`,
          (request, response, next) => {
            Passport.authenticate('local-login', {}, (error, user, info) => {
              if (user === false) {
                return response.status(422).json([
                  {
                    message: 'The email is required.',
                    field: 'email'
                  },
                  {
                    message: 'The password is required.',
                    field: 'password'
                  }
                ])
              }

              if (error || !user) {
                return response.status(400).json(error)
              }

              request.logIn(user, error => {
                if (error) {
                  return next(error)
                }

                return response.status(204).json([])
              })
            })(request, response, next)
          }
        )

        this.router.use(responseEnhancer())

        this.router.use((request, response, next) => {
          // set filter parameters
          resources.forEach(resource => {
            resource.data.filters.forEach(filter => {
              const filterFromBody = request.body.filters?.find(
                (bodyFitler: any) => bodyFitler.name === filter.config.shortName
              )

              request.manager.setFilterParams(
                filter.config.shortName,
                filterFromBody?.args || {}
              )
            })
          })

          next()
        })

        this.router.use(Csurf())
        ;[...getRoutes(config, this.config), ...this.routes()].forEach(
          route => {
            const path = route.config.path.startsWith('/')
              ? route.config.path
              : `/${route.config.path}`
            ;(this.router as any)[route.config.type.toLowerCase()](
              path,

              ...route.config.middleware.map(fn => AsyncHandler(fn)),
              AsyncHandler(async (request, response, next) => {
                await this.authorizeResolver(request as any, route)

                return next()
              }),
              AsyncHandler(async (request, response) =>
                route.config.handler(request, response)
              )
            )
          }
        )

        app.use(`/${this.config.path}`, this.router)

        app.get(`/${this.config.path}(/*)?`, async (request, response) => {
          console.log('=====================================', request.session)
          response.send(
            Mustache.render(indexFileContent, {
              styles: request.styles,
              scripts: request.scripts,
              // @ts-ignore
              user: request.user
                ? JSON.stringify({
                    // @ts-ignore
                    ...request.user
                  })
                : null,
              resources: JSON.stringify(
                request.config.resources.map(r => r.serialize())
              ),
              ctx: JSON.stringify({
                name: request.config.name,
                dashboardPath: this.config.path,
                apiPath: `/${this.config.path}/api`,
                serverUrl: request.config.serverUrl,
                pluginsConfig: currentCtx().pluginsConfig
              }),
              shouldShowRegistrationScreen:
                (await request.manager.count(
                  this.resources.user.data.pascalCaseName
                )) === 0
            })
          )
        })

        app.use(
          '/tensei-assets',
          Static(Path.resolve(__dirname, '..', 'default-assets'))
        )

        extendEvents([
          event('tensei::listening').listen(({ ctx }) => {
            ctx.logger.info(
              `🦄 Access your cms dashboard ${ctx.serverUrl}/${this.config.path}`
            )
          })
        ])
      })
  }
}

export const cms = () => new CmsPlugin()
