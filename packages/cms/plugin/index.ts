import Fs from 'fs'
import Path from 'path'
import Csurf from 'csurf'
import Uniqid from 'uniqid'
import Mustache from 'mustache'
import { DateTime } from 'luxon'
import Randomstring from 'randomstring'
import AsyncHandler from 'express-async-handler'
import { Router, RequestHandler } from 'express'
import { responseEnhancer } from 'express-response-formatter'
import ExpressSession, { CookieOptions } from 'express-session'
import ExpressSessionMikroORMStore, {
    generateSessionEntity
} from 'express-session-mikro-orm'
import {
    route,
    plugin,
    Asset,
    resource,
    text,
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
        return `/${this.config.apiPath}/${path}`
    }

    private resources = {
        user: this.userResource(),
        role: this.roleResource(),
        token: this.tokenResource(),
        permission: this.permissionResource()
    }

    private async sendEmail(user: User, { mailer, orm, serverUrl }: Config) {
        const token = this.generateRandomToken()

        await orm?.em.persistAndFlush(
            orm?.em.create(this.resources.token.data.pascalCaseName, {
                token,
                admin_user: user.id,
                type: 'PASSWORDLESS',
                expires_at: DateTime.local().plus({
                    minutes: 10
                })
            })
        )

        mailer.send(message => {
            message
                .to(user.email)
                .from(user.email)
                .subject('Login with this link')
                .html(
                    `This is an example. ${serverUrl}/${this.config.apiPath}/passwordless/token/${token}`
                )
        })
    }

    public generateRandomToken(length = 32) {
        return (
            Randomstring.generate(length) +
            Uniqid() +
            Randomstring.generate(length)
        )
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
                    token[this.resources.user.data.snakeCaseName]
                        .deactivated_at ||
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
        route('Get CMS Dashboard')
            .get()
            .id('get_cms_dashboard')
            .path(`${this.config.path}(/*)?`)
            .handle(async (request, response) => {
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
                            request.config.resources.map(r => r.serialize())
                        ),
                        ctx: JSON.stringify({
                            dashboardPath: this.config.path,
                            apiPath: `/${this.config.path}/api`
                        }),
                        shouldShowRegistrationScreen:
                            (await request.manager.count(
                                this.resources.user.data.pascalCaseName
                            )) === 0
                    })
                )
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
            .handle(async ({ config, manager, body }, response) => {
                const { indicative, emitter } = config
                try {
                    const { email } = await indicative.validator.validate(
                        body,
                        {
                            email: 'required|email'
                        }
                    )

                    let createUserPayload: any = {
                        email
                    }

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

                    createUserPayload.admin_roles = [authenticatorRole.id]

                    const admin: User = manager.create(
                        this.resources.user.data.pascalCaseName,
                        createUserPayload
                    )
                    await manager.persistAndFlush(admin)

                    emitter.emit('ADMIN_REGISTERED', admin)

                    this.sendEmail(admin, config)

                    return response.status(204).json()
                } catch (errors) {
                    console.log(errors)
                    return response.status(422).json(errors)
                }
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
                text('Name').searchable().rules('required'),
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
                    .rules('required'),
                text('Slug')
                    .rules('required')
                    .unique()
                    .searchable()
                    .rules('required'),
                text('Description').nullable().rules('max:255'),
                belongsToMany(this.config.userResource),
                belongsToMany(this.config.permissionResource).owner()
            ])
            .displayField('Name')
            .hideFromNavigation()
    }

    private userResource() {
        return resource(this.config.userResource)
            .fields([
                text('Email')
                    .unique()
                    .searchable()
                    .notNullable()
                    .creationRules('required', 'email', 'unique:email'),
                dateTime('Deactivated At').nullable(),
                belongsToMany(this.config.roleResource)
            ])
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
                user[this.resources.permission.data.snakeCaseName] = user[
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
            .register(
                ({ app, script, style, extendResources, databaseConfig }) => {
                    this.scripts.forEach(s => script(s.name, s.path))
                    this.styles.forEach(s => style(s.name, s.path))

                    // this.router.use(Csurf())

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
                }
            )
            .boot(async config => {
                const { app, orm } = config
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

                this.router.get('/beans', (r, re) => {
                    re.json(['beans', 'corn'])
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

                app.use(this.router)
            })
    }
}

export const cms = () => new CmsPlugin()