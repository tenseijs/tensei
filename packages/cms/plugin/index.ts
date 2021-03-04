import Fs from 'fs'
import Path from 'path'
import Csurf from 'csurf'
import crypto from 'crypto'
import Mustache from 'mustache'
import { DateTime } from 'luxon'
import AsyncHandler from 'express-async-handler'
import { Router, RequestHandler, static as Static } from 'express'
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
        },
        {
            name: 'main.css',
            path: Path.resolve(__dirname, 'public', 'main.css')
        }
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

    private async sendEmail(
        user: User,
        { mailer, orm, serverUrl, name }: Config
    ) {
        const token = this.generateRandomToken()

        await orm?.em.persistAndFlush(
            orm?.em.create(this.resources.token.data.pascalCaseName, {
                token,
                admin_user: user.id,
                type: 'PASSWORDLESS',
                expires_at: DateTime.local().plus({
                    minutes: 15
                })
            })
        )

        const url = `${serverUrl}/${this.config.apiPath}/passwordless/token/${token}`

        mailer.send(message => {
            message
                .to(user.email)
                .from(user.email)
                .subject(`Sign-in link for ${name}.`)
                .html(
                    `
<p>Hi! 👋</p>

<p>You asked us to send you a sign-in link for ${name}.</p>

<ul>
    <li>
        This link expires in 13 minutes. After that you will need to request another link.
    </li>
    <li>
        This link can only be used once. After you click the link it will no longer work.
    </li>

    <li>
      You can always request another link!
    </li>
</ul>

<p>
==> <a href="${url}">Click here to access the ${name} cms dashboard</a>
</p>

<b><i>Note: This link expires in 13 minutes and can only be used once. You can always request another link to be sent if this one has been used or is expired.</i></b>
`
                )
        })
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
        route('Passwordless Token')
            .get()
            .path(this.getApiPath('passwordless/token/:token'))
            .id('passwordless_token')
            .handle(async (request, response) => {
                const { token: tokenString } = request.params

                const token: any = await request.manager.findOne(
                    this.resources.token.data.pascalCaseName,
                    {
                        token: tokenString
                    },
                    { populate: [this.resources.user.data.snakeCaseName] }
                )

                if (
                    !token ||
                    !token[this.resources.user.data.snakeCaseName].active ||
                    token.expires_at < new Date()
                ) {
                    return response
                        .status(401)
                        .redirect(
                            `/${this.config.path}/auth/login?error=Your login credentials are invalid. Please try again.`
                        )
                }

                request.manager.assign(token, {
                    expires_at: DateTime.local().minus({
                        second: 1
                    })
                })

                await request.manager.persistAndFlush(token)

                request.session.user = {
                    id: token[this.resources.user.data.snakeCaseName].id
                }

                return response.redirect(`/${this.config.path}`)
            }),
        route('Passwordless Email Registration')
            .post()
            .path(this.getApiPath('passwordless/email/register'))
            .id('passwordless_email_register')
            .authorize(
                async ({ manager }) =>
                    (await manager.count(
                        this.resources.user.data.pascalCaseName
                    )) === 0
            )
            .handle(async ({ config, manager, body, resources }, response) => {
                const { emitter } = config

                const validator = Utils.validator(
                    this.userResource(),
                    manager,
                    resources
                )

                const [success, payload] = await validator.validate(body)

                if (!success) {
                    return response.status(422).json(payload)
                }

                let createUserPayload: any = {
                    email: payload.email
                }

                let roles = payload.admin_roles

                if (!roles || (roles && roles.length === 0)) {
                    const authenticatorRole: any = await manager.findOne(
                        this.resources.role.data.pascalCaseName,
                        {
                            slug: 'super-admin'
                        }
                    )

                    if (!authenticatorRole) {
                        throw {
                            status: 400,
                            message:
                                'The authenticated role must be created to use roles and permissions.'
                        }
                    }

                    roles = [authenticatorRole.id]
                }

                createUserPayload.admin_roles = roles

                const admin: User = manager.create(
                    this.resources.user.data.pascalCaseName,
                    createUserPayload
                )
                await manager.persistAndFlush(admin)

                emitter.emit('ADMIN_REGISTERED', admin)

                this.sendEmail(admin, config)

                return response.status(204).json()
            }),
        route('Passwordless Email Login')
            .post()
            .path(this.getApiPath('passwordless/email/login'))
            .id('passwordless_email_login')
            .handle(async ({ config, manager, body }, response) => {
                const { indicative, emitter } = config
                try {
                    const { email } = await indicative.validator.validate(
                        body,
                        {
                            email: 'required|email'
                        }
                    )

                    let user: any = await manager.findOne(
                        this.resources.user.data.pascalCaseName,
                        {
                            email
                        }
                    )

                    if (!user) {
                        return response.status(401).json([
                            {
                                field: 'email',
                                message: 'This user does not exist.'
                            }
                        ])
                    }

                    emitter.emit('ADMIN_REGISTERED', user)

                    this.sendEmail(user, config)

                    return response.status(204).json()
                } catch (errors) {
                    console.log(errors)
                    return response.status(422).json(errors)
                }
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

    private permissionResource() {
        return resource(this.config.permissionResource)
            .fields([
                text('Name')
                    .searchable()
                    .rules('required'),
                text('Slug')
                    .rules('required')
                    .unique()
                    .searchable()
                    .rules('required'),
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
                text('Description')
                    .nullable()
                    .rules('max:255'),
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
                text('Full name')
                    .unique()
                    .searchable()
                    .nullable()
                    .sortable()
                    .rules('unique:full_name'),
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
    }

    sessionMikroOrmOptions = {
        entityName: `${this.resources.user.data.pascalCaseName}Session`,
        tableName: `${this.resources.user.data.snakeCaseNamePlural}_sessions`,
        collection: `${this.resources.user.data.snakeCaseNamePlural}_sessions`
    }

    private authorizeResolver = async (
        ctx: ApiContext,
        query: RouteContract
    ) => {
        const authorized = await Promise.all(
            query.config.authorize.map(fn => fn(ctx))
        )

        if (
            authorized.filter(result => result).length !==
            query.config.authorize.length
        ) {
            throw ctx.forbiddenError('Unauthorized.')
        }
    }

    private getRolesAndPermissionsNames() {
        return `${this.resources.role.data.snakeCaseNamePlural}.${this.resources.permission.data.snakeCaseNamePlural}`
    }

    private getRoleUserKey() {
        return this.resources.role.data.snakeCaseNamePlural
    }

    private getPermissionUserKey() {
        return this.resources.permission.data.snakeCaseNamePlural
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
                    id: session.user?.id
                },
                {
                    populate: [this.getRolesAndPermissionsNames()]
                }
            )

            if (user) {
                user[this.resources.permission.data.snakeCaseNamePlural] = user[
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

                await setupCms(config, [
                    this.resources.role,
                    this.resources.permission
                ])

                this.router.use(
                    ExpressSession({
                        resave: false,
                        saveUninitialized: false,
                        store: new Store({ orm }) as any,
                        cookie: this.config.cookieOptions,
                        secret:
                            process.env.SESSION_SECRET || '__sessions__secret__'
                    })
                )

                this.router.use(responseEnhancer())

                this.router.use(this.setAuth)

                this.router.use((request, response, next) => {
                    // set filter parameters
                    resources.forEach(resource => {
                        resource.data.filters.forEach(filter => {
                            const filterFromBody = request.body.filters?.find(
                                (bodyFitler: any) =>
                                    bodyFitler.name === filter.config.shortName
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

                            ...route.config.middleware.map(fn =>
                                AsyncHandler(fn)
                            ),
                            AsyncHandler(async (request, response, next) => {
                                await this.authorizeResolver(
                                    request as any,
                                    route
                                )

                                return next()
                            }),
                            AsyncHandler(async (request, response) =>
                                route.config.handler(request, response)
                            )
                        )
                    }
                )

                app.use(`/${this.config.path}`, this.router)

                app.get(
                    `/${this.config.path}(/*)?`,
                    async (request, response) => {
                        response.send(
                            Mustache.render(indexFileContent, {
                                styles: request.styles,
                                scripts: request.scripts,
                                user: request.user
                                    ? JSON.stringify({
                                          ...request.user
                                      })
                                    : null,
                                resources: JSON.stringify(
                                    request.config.resources.map(r =>
                                        r.serialize()
                                    )
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
                    }
                )

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
