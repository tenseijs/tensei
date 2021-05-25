import Dayjs from 'dayjs'
import crypto from 'crypto'
import Bcrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import { ReferenceType } from '@mikro-orm/core'
import { validateAll } from 'indicative/validator'
import {
    plugin,
    resource,
    text,
    json,
    textarea,
    belongsTo,
    belongsToMany,
    dateTime,
    DataPayload,
    FieldContract,
    hasMany,
    boolean,
    select,
    filter,
    password,
    graphQlQuery,
    GraphQLPluginContext,
    route,
    GraphQlQueryContract,
    ApiContext,
    UserRole,
    Utils
} from '@tensei/common'

import {
    USER_EVENTS,
    AuthData,
    TokenTypes,
    GrantConfig,
    AuthResources,
    AuthPluginConfig,
    SupportedSocialProviders,
    defaultProviderScopes,
    AuthHookFunction
} from './config'

import { setup } from './setup'
import { ResourceContract } from '@tensei/common'
import { Request } from 'express'

type JwtPayload = {
    id: string
    refresh?: boolean
}

type AuthSetupFn = (resources: AuthResources) => any

class Auth {
    private config: AuthPluginConfig & {
        setupFn: AuthSetupFn
    } = {
        prefix: '',
        autoFillUser: true,
        autoFilterForUser: true,
        tokenResource: 'Token',
        enableRefreshTokens: false,
        userResource: 'User',
        roleResource: 'Role',
        excludedPathsFromCsrf: [],
        httpOnlyCookiesAuth: false,
        permissionResource: 'Permission',
        passwordResetResource: 'Password Reset',
        fields: [],
        separateSocialLoginAndRegister: false,
        apiPath: 'auth',
        setupFn: () => this,
        beforeLogin: () => {},
        afterLogin: () => {},
        beforeRegister: () => {},
        afterRegister: () => {},
        beforePasswordReset: () => {},
        afterPasswordReset: () => {},
        tokensConfig: {
            accessTokenExpiresIn: 60 * 20, // twenty minutes
            secretKey: process.env.JWT_SECRET || 'auth-secret-key',
            refreshTokenExpiresIn: 60 * 60 * 24 * 30 * 6 // 6 months
        },
        cookieOptions: {
            secure: false
        },
        refreshTokenHeaderName: 'x-tensei-refresh-token',
        twoFactorAuth: false,
        verifyEmails: false,
        skipWelcomeEmail: false,
        rolesAndPermissions: false,
        providers: {}
    }

    private TwoFactorAuth: any = null

    private resources: AuthResources = {} as any

    public constructor() {
        this.refreshResources()
    }

    public separateSocialLoginAndRegister() {
        this.config.separateSocialLoginAndRegister = true

        return this
    }

    public cookieSessions() {
        this.config.httpOnlyCookiesAuth = true

        return this
    }

    public registered(registered: AuthPluginConfig['registered']) {
        this.config.registered = registered

        return this
    }

    public refreshTokens() {
        this.config.enableRefreshTokens = true

        return this
    }

    private refreshResources() {
        this.resources.user = this.userResource()
        this.resources.role = this.roleResource()
        this.resources.token = this.tokenResource()
        this.resources.oauthIdentity = this.oauthResource()
        this.resources.permission = this.permissionResource()
        this.resources.passwordReset = this.passwordResetResource()

        this.config.setupFn(this.resources)
    }

    public setup(fn: AuthSetupFn) {
        this.config.setupFn = fn

        return this
    }

    public beforeLogin(fn: AuthHookFunction) {
        this.config.beforeLogin = fn

        return this
    }

    public afterLogin(fn: AuthHookFunction) {
        this.config.afterLogin = fn

        return this
    }

    public beforeRegister(fn: AuthHookFunction) {
        this.config.beforeRegister = fn

        return this
    }

    public afterRegister(fn: AuthHookFunction) {
        this.config.afterRegister = fn

        return this
    }

    public beforePasswordReset(fn: AuthHookFunction) {
        this.config.beforePasswordReset = fn

        return this
    }

    public afterPasswordReset(fn: AuthHookFunction) {
        this.config.afterPasswordReset = fn

        return this
    }

    public user(name: string) {
        this.config.userResource = name

        return this
    }

    public verifyEmails() {
        this.config.verifyEmails = true

        return this
    }

    public configureTokens(config: Partial<AuthPluginConfig['tokensConfig']>) {
        this.config.tokensConfig = {
            ...this.config.tokensConfig,
            ...config
        }

        return this
    }

    public apiPath(path: string) {
        this.config.apiPath = path

        return this
    }

    public fields(fields: AuthPluginConfig['fields']) {
        this.config.fields = fields

        return this
    }

    public twoFactorAuth() {
        this.TwoFactorAuth = require('@tensei/two-factor-auth')
        this.config.twoFactorAuth = true

        return this
    }

    public role(name: string) {
        this.config.roleResource = name

        return this
    }

    public token(name: string) {
        this.config.tokenResource = name

        return this
    }

    public permission(name: string) {
        this.config.permissionResource = name

        return this
    }

    public rolesAndPermissions() {
        this.config.rolesAndPermissions = true

        return this
    }

    private userResource() {
        let passwordField = password('Password')

        let socialFields: FieldContract[] = []

        if (Object.keys(this.config.providers).length === 0) {
            passwordField = passwordField.notNullable()
        } else {
            socialFields = [
                hasMany(this.resources.oauthIdentity.data.name)
                    .hideOnInsertApi()
                    .hideOnUpdateApi()
            ]
            passwordField = passwordField.nullable()
        }

        const userResource = resource(this.config.userResource)
            .fields([
                text('Email')
                    .unique()
                    .searchable()
                    .notNullable()
                    .creationRules('required', 'email', 'unique:email'),
                passwordField
                    .hidden()
                    .htmlAttributes({
                        type: 'password'
                    })
                    .creationRules('required')
                    .onlyOnForms()
                    .hideOnUpdateApi(),
                boolean('Blocked')
                    .nullable()
                    .default(false)
                    .trueLabel('No')
                    .falseLabel('Yes')
                    .positiveValues(['false', false])
                    .defaultFormValue(false)
                    .hideOnApi(),
                ...socialFields,
                ...(this.config.rolesAndPermissions
                    ? [
                          belongsToMany(
                              this.config.roleResource
                          ).hideOnInsertApi()
                      ]
                    : []),
                ...(this.config.twoFactorAuth
                    ? [
                          boolean('Two Factor Enabled')
                              .hideOnCreate()
                              .hideOnUpdate()
                              .nullable(),
                          text('Two Factor Secret')
                              .hideOnApi()
                              .hideOnDetail()
                              .hideOnIndex()
                              .hideOnCreate()
                              .hideOnUpdate()
                              .nullable()
                      ]
                    : []),
                ...this.config.fields,
                ...(this.config.verifyEmails
                    ? [
                          dateTime('Email Verified At')
                              .hideOnIndex()
                              .hideOnDetail()
                              .hideOnInsertApi()
                              .hideOnUpdateApi()
                              .nullable(),
                          text('Email Verification Token')
                              .hidden()
                              .nullable()
                              .hideOnApi()
                              .hideOnCreate()
                              .hideOnIndex()
                              .hideOnUpdate()
                              .hideOnDetail()
                      ]
                    : [])
            ])
            .hideOnFetchApi()
            .hideOnDeleteApi()
            .beforeCreate(async ({ entity, em }) => {
                const payload: DataPayload = {
                    password: entity.password
                        ? Bcrypt.hashSync(entity.password)
                        : undefined
                }

                if (this.config.verifyEmails) {
                    payload.email_verified_at = null
                    payload.email_verification_token = this.generateRandomToken()
                }

                em.assign(entity, payload)
            })
            .beforeCreate(async ({ entity, em }, ctx) => {
                if (
                    this.socialAuthEnabled() &&
                    ctx.request?.body?.object?.extra
                ) {
                    em.assign(entity, ctx.request.body.object.extra)
                }
            })
            .beforeUpdate(async ({ entity, em, changeSet }) => {
                if (changeSet?.payload.password) {
                    em.assign(entity, {
                        password: Bcrypt.hashSync(changeSet.payload.password)
                    })
                }
            })
            .icon('database-manager')
            .group('Users & Permissions')

        return userResource
    }

    private tokenResource() {
        const tokenTypes = []

        if (this.config.enableRefreshTokens) {
            tokenTypes.push({
                label: 'Refresh Token',
                value: TokenTypes.REFRESH
            })
        }

        return resource(this.config.tokenResource)
            .fields([
                text('Token').notNullable().hidden().searchable().unique(),
                text('Name').searchable().nullable(),
                select('Type').options(tokenTypes).searchable().nullable(),
                dateTime('Last Used At').nullable(),
                dateTime('Compromised At').nullable(),
                dateTime('Expires At').hidden(),
                belongsTo(this.config.userResource).nullable()
            ])
            .disableAutoFilters()
            .hideOnApi()
    }

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
            .hideOnDeleteApi()
            .hideOnUpdateApi()
            .hideFromNavigation()
            .group('Users & Permissions')
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
                    .hideOnUpdate()
                    .rules('required'),
                belongsToMany(this.config.userResource),
                belongsToMany(this.config.permissionResource).owner()
            ])
            .displayField('Name')
            .hideFromNavigation()
            .hideOnUpdateApi()
            .group('Users & Permissions')
    }

    private passwordResetResource() {
        return resource(this.config.passwordResetResource)
            .hideFromNavigation()
            .fields([
                text('Email').searchable().unique().notNullable(),
                text('Token').unique().notNullable().hidden(),
                dateTime('Expires At')
            ])
            .hideOnApi()
    }

    private oauthResource() {
        return resource('Oauth Identity')
            .hideFromNavigation()
            .fields([
                belongsTo(this.config.userResource).nullable(),
                textarea('Access Token').hidden().hideOnApi(),
                text('Email').hidden().hideOnApi(),
                textarea('Temporal Token').nullable().hidden().hideOnApi(),
                json('Payload').hidden().hideOnApi(),
                text('Provider').rules('required'),
                text('Provider User ID').hidden().hideOnApi()
            ])
            .hideFromNavigation()
            .hideOnApi()
    }

    private forceRemoveInsertUserQueries(queries: GraphQlQueryContract[]) {
        const insert_user_index = queries.findIndex(
            q =>
                q.config.path ===
                `insert_${this.resources.user.data.snakeCaseName}`
        )

        if (insert_user_index !== -1) {
            queries.splice(insert_user_index, 1)
        }

        const insert_users_index = queries.findIndex(
            q =>
                q.config.path ===
                `insert_${this.resources.user.data.snakeCaseNamePlural}`
        )

        if (insert_users_index !== -1) {
            queries.splice(insert_users_index, 1)
        }
    }

    public excludePathsFromCsrf(paths: string[]) {
        this.config.excludedPathsFromCsrf = paths

        return this
    }

    public noAutofillUser() {
        this.config.autoFillUser = false

        return this
    }

    public noAutoFilters() {
        this.config.autoFilterForUser = false

        return this
    }

    private registerAutofillUserHooks(resources: ResourceContract[]) {
        resources
            .filter(
                resource =>
                    resource.data.fields.find(
                        field =>
                            field.relatedProperty.reference ===
                                ReferenceType.MANY_TO_ONE &&
                            field.relatedProperty.type ===
                                this.config.userResource
                    ) && !resource.data.disableAutoFills
            )
            .forEach(resource => {
                resource.beforeCreate(({ entity, em }, { request }) => {
                    if (request.user && request.user.id) {
                        em.assign(entity, {
                            user: request.user.id
                        })
                    }
                })
            })
    }

    private registerAutoFilterUserHooks(resources: ResourceContract[]) {
        resources
            .filter(
                resource =>
                    resource.data.fields.find(
                        field =>
                            field.relatedProperty.reference ===
                                ReferenceType.MANY_TO_ONE &&
                            field.relatedProperty.type ===
                                this.config.userResource
                    ) && !resource.data.disableAutoFilters
            )
            .forEach(resource => {
                resource.filters([
                    filter(
                        `${this.resources.user.data.label} ${resource.data.label}`
                    )
                        .default()
                        .noArgs()
                        .query((args, request) =>
                            request.user && request.user.id
                                ? {
                                      [this.resources.user.data.snakeCaseName]:
                                          request.user.id
                                  }
                                : resource.data.noTimestamps
                                ? false
                                : {
                                      created_at: Dayjs()
                                          .add(1, 'month')
                                          .toDate()
                                  }
                        )
                ])
            })
    }

    public plugin() {
        return plugin('Auth')
            .extra(this.config)
            .register(
                ({
                    gql,
                    currentCtx,
                    extendRoutes,
                    databaseConfig,
                    extendResources,
                    extendGraphQlTypeDefs,
                    extendGraphQlQueries
                }) => {
                    this.refreshResources()

                    extendResources([
                        this.resources.user,
                        this.resources.passwordReset
                    ])

                    if (this.config.rolesAndPermissions) {
                        extendResources([
                            this.resources.role,
                            this.resources.permission
                        ])
                    }

                    if (this.config.enableRefreshTokens) {
                        extendResources([this.resources.token])
                    }

                    if (Object.keys(this.config.providers).length > 0) {
                        extendResources([this.resources.oauthIdentity])
                    }

                    if (
                        this.socialAuthEnabled() ||
                        this.config.httpOnlyCookiesAuth
                    ) {
                        databaseConfig.entities = [
                            ...(databaseConfig.entities || []),
                            require('express-session-mikro-orm').generateSessionEntity(
                                {
                                    entityName: `${this.resources.user.data.pascalCaseName}Session`,
                                    tableName: `${this.resources.user.data.snakeCaseNamePlural}_sessions`,
                                    collection: `${this.resources.user.data.snakeCaseNamePlural}_sessions`
                                }
                            )
                        ]
                    }

                    extendGraphQlTypeDefs([this.extendGraphQLTypeDefs(gql)])
                    extendGraphQlQueries(this.extendGraphQlQueries())
                    extendRoutes(this.extendRoutes())

                    if (this.config.autoFillUser) {
                        this.registerAutofillUserHooks(currentCtx().resources)
                    }

                    if (this.config.autoFilterForUser) {
                        this.registerAutoFilterUserHooks(currentCtx().resources)
                    }
                }
            )

            .boot(async config => {
                this.refreshResources()

                if (this.config.twoFactorAuth) {
                    config.app.use((request, response, next) => {
                        request.verifyTwoFactorAuthToken = (
                            token: string | number
                        ) =>
                            this.TwoFactorAuth.verifyTwoFactorAuthToken(
                                request,
                                token
                            )

                        next()
                    })
                }

                if (this.config.rolesAndPermissions) {
                    await setup(config, [
                        this.resources.role,
                        this.resources.permission
                    ])
                }

                const {
                    app,
                    serverUrl,
                    clientUrl,
                    currentCtx,
                    routes,
                    setPluginConfig
                } = config

                this.forceRemoveInsertUserQueries(config.graphQlQueries)

                setPluginConfig('auth', {
                    rolesAndPermissions: this.config.rolesAndPermissions,
                    user: this.resources.user.serialize(),
                    role: this.resources.role.serialize(),
                    permission: this.resources.permission.serialize()
                })

                if (this.config.httpOnlyCookiesAuth) {
                    const excludedRoutes = routes.filter(
                        route => !route.config.csrf
                    )

                    this.config.excludedPathsFromCsrf = [
                        ...this.config.excludedPathsFromCsrf,
                        ...excludedRoutes.map(route => route.config.path)
                    ]

                    require('@tensei/cookie-sessions').register({
                        app,
                        excludedPaths: this.config.excludedPathsFromCsrf
                    })
                }

                if (
                    this.config.httpOnlyCookiesAuth ||
                    this.socialAuthEnabled()
                ) {
                    const ExpressSession = require('express-session')
                    const ExpressSessionMikroORMStore = require('express-session-mikro-orm')
                        .default

                    const Store = ExpressSessionMikroORMStore(ExpressSession, {
                        entityName: `${this.resources.user.data.pascalCaseName}Session`,
                        tableName: `${this.resources.user.data.snakeCaseNamePlural}_sessions`,
                        collection: `${this.resources.user.data.snakeCaseNamePlural}_sessions`
                    })

                    app.use(
                        ExpressSession({
                            store: new Store({
                                orm: config.orm
                            }) as any,
                            resave: false,
                            saveUninitialized: false,
                            cookie: this.config.cookieOptions,
                            secret:
                                process.env.SESSION_SECRET ||
                                '__sessions__secret__'
                        })
                    )
                }

                if (this.socialAuthEnabled()) {
                    const { register } = require('@tensei/social-auth')

                    register({
                        app,
                        clientUrl,
                        serverUrl,
                        orm: config.orm,
                        authConfig: this.config,
                        resourcesMap: this.resources,
                        apiPath: this.config.apiPath,
                        getUserPayloadFromProviderData: this.config
                            .getUserPayloadFromProviderData
                    })
                }

                currentCtx().graphQlQueries.forEach(query => {
                    query.middleware(
                        async (resolve, parent, args, context, info) => {
                            await this.getAuthUserFromContext(context)

                            await this.setAuthUserForPublicRoutes(context)

                            await this.ensureAuthUserIsNotBlocked(context)

                            return resolve(parent, args, context, info)
                        }
                    )
                    if (
                        query.config.resource &&
                        this.config.rolesAndPermissions
                    ) {
                        const { path, internal } = query.config
                        const {
                            snakeCaseNamePlural: plural,
                            snakeCaseName: singular,
                            slug
                        } = query.config.resource.data

                        if (!internal) {
                            return
                        }

                        if (
                            [`insert_${plural}`, `insert_${singular}`].includes(
                                path
                            )
                        ) {
                            return query.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `insert:${slug}`
                                    )
                            )
                        }

                        if (
                            [`delete_${plural}`, `delete_${singular}`].includes(
                                path
                            )
                        ) {
                            return query.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `delete:${slug}`
                                    )
                            )
                        }

                        if (
                            [`update_${plural}`, `update_${singular}`].includes(
                                path
                            )
                        ) {
                            return query.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `update:${slug}`
                                    )
                            )
                        }

                        if (path === plural || path === `${plural}__count`) {
                            return query.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `index:${slug}`
                                    )
                            )
                        }

                        if (path === singular) {
                            return query.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `show:${slug}`
                                    )
                            )
                        }
                    }
                })

                currentCtx().routes.forEach(route => {
                    route.middleware([
                        async (request, response, next) => {
                            await this.getAuthUserFromContext(request as any)

                            await this.setAuthUserForPublicRoutes(
                                request as any
                            )

                            await this.ensureAuthUserIsNotBlocked(
                                request as any
                            )

                            return next()
                        }
                    ])
                    if (
                        route.config.resource &&
                        this.config.rolesAndPermissions
                    ) {
                        const { resource, id } = route.config

                        const { slugSingular, slugPlural } = resource.data

                        route.extend({
                            ...route.config.extend,
                            docs: {
                                ...route.config.extend?.docs,
                                security: [
                                    {
                                        Bearer: []
                                    }
                                ]
                            }
                        })

                        if (
                            id === `insert_${slugPlural}` ||
                            id === `insert_${slugSingular}`
                        ) {
                            return route.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `insert:${slugPlural}`
                                    )
                            )
                        }

                        if (id === `index_${slugPlural}`) {
                            return route.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `index:${slugPlural}`
                                    )
                            )
                        }

                        if (id === `show_${slugSingular}`) {
                            return route.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `show:${slugPlural}`
                                    )
                            )
                        }

                        if (
                            id === `update_${slugSingular}` ||
                            id === `update_${slugPlural}`
                        ) {
                            return route.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]?.includes(
                                        `update:${slugPlural}`
                                    )
                            )
                        }

                        if (
                            id === `delete_${slugSingular}` ||
                            id === `delete_${slugPlural}`
                        ) {
                            return route.authorize(
                                ({ user }) =>
                                    user &&
                                    user[this.getPermissionUserKey()]!.includes(
                                        `delete:${slugPlural}`
                                    )
                            )
                        }
                    }
                })
            })
    }

    private getRegistrationFieldsDocs() {
        const properties: any = {}

        // TODO: Calculate and push new registration fields to be exposed to API

        return properties
    }

    private extendRoutes() {
        const name = this.resources.user.data.slugSingular

        return [
            route(`Login ${name}`)
                .group('Auth')
                .path(this.getApiPath('login'))
                .id(this.getRouteId(`login_${name}`))
                .post()
                .description(`Login an existing ${name}.`)
                .parameters([
                    {
                        in: 'body',
                        validation: ['required', 'email'],
                        description: `The email of the ${name}`,
                        name: 'email',
                        type: 'string'
                    },
                    {
                        in: 'body',
                        validation: ['required'],
                        description: `The password of the ${name}`,
                        name: 'password',
                        type: 'string'
                    }
                ])
                .handle(async (request, { formatter: { ok } }) =>
                    ok(await this.login(request as any))
                ),
            ...(this.config.httpOnlyCookiesAuth
                ? [
                      route(`Logout ${name}`)
                          .group('Auth')
                          .path(this.getApiPath('logout'))
                          .id(this.getRouteId(`logout_${name}`))
                          .post()
                          .description(`Logout a currently logged in ${name}.`)
                          .handle(
                              async (request, { formatter: { noContent } }) => {
                                  noContent(await this.logout(request as any))
                              }
                          )
                  ]
                : []),
            route(`Register ${name}`)
                .path(this.getApiPath('register'))
                .group('Auth')
                .post()
                .parameters([
                    {
                        in: 'body',
                        validation: ['required', 'email'],
                        description: `The email of the ${name}`,
                        name: 'email',
                        type: 'string'
                    },
                    {
                        in: 'body',
                        validation: ['required'],
                        description: `The password of the ${name}`,
                        name: 'password',
                        type: 'string'
                    }
                ])
                .id(this.getRouteId(`register_${name}`))
                .handle(
                    async (request, { formatter: { created, unprocess } }) => {
                        return created(await this.register(request as any))
                    }
                ),
            route(`Request password reset`)
                .path(this.getApiPath('passwords/email'))
                .post()
                .group('Auth')
                .parameters([
                    {
                        in: 'body',
                        validation: ['required', 'email'],
                        description: `The email of the ${name}`,
                        name: 'email',
                        type: 'string'
                    }
                ])
                .id(this.getRouteId(`request_password_reset_${name}`))
                .description(
                    `Request a password reset for a ${name} using the ${name} email.`
                )
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.forgotPassword(request as any)
                    )
                ),

            route(`Reset password`)
                .path(this.getApiPath('passwords/reset'))
                .post()
                .group('Auth')
                .id(this.getRouteId(`reset_password_${name}`))
                .description(
                    `Reset a ${name} password using a password reset token.`
                )
                .parameters([
                    {
                        in: 'body',
                        validation: ['required'],
                        description: `This token was sent to the ${name}'s email. Provide it here to reset the ${name}'s password.`,
                        name: 'token',
                        type: 'string'
                    },
                    {
                        in: 'body',
                        validation: ['required'],
                        description: `The password of the ${name}`,
                        name: 'password',
                        type: 'string'
                    }
                ])
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.resetPassword(request as any)
                    )
                ),
            ...(this.config.twoFactorAuth
                ? [
                      route(`Enable Two Factor Auth`)
                          .path(this.getApiPath('two-factor/enable'))
                          .post()
                          .group('Two Factor Auth')
                          .description(
                              `Enable two factor authentication for an existing ${name}.`
                          )
                          .authorize(({ user }) => user && !user.public)
                          .handle(async (request, response) =>
                              response.formatter.ok(
                                  await this.TwoFactorAuth.enableTwoFactorAuth(
                                      request as any
                                  )
                              )
                          ),
                      route(`Confirm Enable Two Factor Auth`)
                          .path(this.getApiPath('two-factor/confirm'))
                          .post()
                          .group('Two Factor Auth')
                          .parameters([
                              {
                                  in: 'body',
                                  validation: ['required'],
                                  description: `The two-factor code from the authentication application such as Google Authenticator ${name}`,
                                  name: 'password',
                                  type: 'string'
                              }
                          ])
                          .description(
                              `This endpoint confirms enabling 2fa for an account. A previous call to /${this.config.apiPath}/two-factor/enable is required to generate a 2fa secret for the ${name}'s account.`
                          )
                          .authorize(({ user }) => user && !user.public)
                          .handle(async (request, response) =>
                              response.formatter.ok(
                                  await this.TwoFactorAuth.confirmEnableTwoFactorAuth(
                                      request as any
                                  )
                              )
                          ),
                      route(`Disable Two Factor Auth`)
                          .path(this.getApiPath('two-factor/disable'))
                          .post()
                          .group('Two Factor Auth')
                          .parameters([
                              {
                                  in: 'body',
                                  validation: ['required'],
                                  description: `The two-factor code from the authentication application such as Google Authenticator ${name}`,
                                  name: 'password',
                                  type: 'string'
                              }
                          ])
                          .description(
                              `Disable two factor authentication for an existing ${name}.`
                          )
                          .authorize(({ user }) => user && !user.public)
                          .authorize(({ user }) => !!user)
                          .handle(async (request, response) =>
                              response.formatter.ok(
                                  await this.TwoFactorAuth.disableTwoFactorAuth(
                                      request as any
                                  )
                              )
                          )
                  ]
                : []),
            route(`Get authenticated ${name}`)
                .path(this.getApiPath('me'))
                .group('Auth')
                .get()
                .id(this.getRouteId(`get_authenticated_${name}`))
                .authorize(({ user }) =>
                    this.config.rolesAndPermissions
                        ? user && !user.public
                        : !!user
                )
                .description(
                    `Get the authenticated ${name} from a valid JWT or session.`
                )
                .handle(async ({ user }, { formatter: { ok } }) => ok(user)),
            ...(this.config.verifyEmails
                ? [
                      route(`Resend Verification email`)
                          .group('Verify Emails')
                          .path(this.getApiPath('emails/verification/resend'))
                          .post()
                          .id(
                              this.getRouteId(
                                  `resend_${name}_verification_email`
                              )
                          )
                          .authorize(({ user }) =>
                              this.config.rolesAndPermissions
                                  ? user && !user.public
                                  : !!user
                          )
                          .description(
                              `Resend verification email to ${name} email.`
                          )
                          .handle(async (request, response) =>
                              response.formatter.ok(
                                  await this.resendVerificationEmail(
                                      request as any
                                  )
                              )
                          ),
                      route(`Confirm ${name} email`)
                          .path(this.getApiPath('emails/verification/confirm'))
                          .post()
                          .group('Verify Emails')
                          .parameters([
                              {
                                  in: 'body',
                                  validation: ['required'],
                                  description: `This email confirmation token was sent to the ${name}'s email. Provide it here to confirm the ${name}'s email.`,
                                  name: 'token',
                                  type: 'string'
                              }
                          ])
                          .id(this.getRouteId(`confirm_${name}_email`))
                          .description(
                              `Confirm ${name} email with email verification token.`
                          )
                          .handle(async (request, response) =>
                              response.formatter.ok(
                                  await this.confirmEmail(request as any)
                              )
                          )
                  ]
                : []),
            ...(this.socialAuthEnabled()
                ? this.config.separateSocialLoginAndRegister
                    ? [
                          route(`Social Auth Login`)
                              .path(this.getApiPath('social/login'))
                              .post()
                              .id('social_login')
                              .description(
                                  `Login a ${name} via a social provider.`
                              )
                              .group('Social Auth')
                              .handle(async (request, response) =>
                                  response.formatter.ok(
                                      await this.socialAuth(
                                          request as any,
                                          'login'
                                      )
                                  )
                              ),
                          route(`Social Auth Register`)
                              .path(this.getApiPath('social/register'))
                              .id('social_register')
                              .post()
                              .group('Social Auth')
                              .description(
                                  `Register a ${name} via a social provider.`
                              )
                              .handle(async (request, response) =>
                                  response.formatter.ok(
                                      await this.socialAuth(
                                          request as any,
                                          'register'
                                      )
                                  )
                              )
                      ]
                    : [
                          route(`Social Auth Confirm`)
                              .path(this.getApiPath(`social/confirm`))
                              .id('social_confirm')
                              .post()
                              .description(
                                  `Confirm a ${name} (login or register) via a social provider. If this user is already registered, it'll login the user. If not, it'll register a new account for the user and login that user.`
                              )
                              .handle(async (request, response) =>
                                  response.formatter.ok(
                                      await this.socialAuth(request as any)
                                  )
                              )
                      ]
                : []),
            ...(this.config.enableRefreshTokens
                ? [
                      route('Refresh Token')
                          .path(this.getApiPath('refresh-token'))
                          .post()
                          .group('Auth')
                          .id(this.getRouteId(`refresh_token_${name}`))
                          .handle(
                              async (
                                  request,
                                  { formatter: { ok, unauthorized } }
                              ) => {
                                  try {
                                      return ok(
                                          await this.handleRefreshTokens(
                                              request as any
                                          )
                                      )
                                  } catch (error) {
                                      return unauthorized({
                                          message:
                                              error.message ||
                                              'Invalid refresh token.'
                                      })
                                  }
                              }
                          )
                  ]
                : []),
            ...(this.config.httpOnlyCookiesAuth
                ? [
                      route('Get CSRF Token')
                          .path(this.getApiPath('csrf'))
                          .handle(async (request, response) => {
                              response.cookie(
                                  'XSRF-TOKEN',
                                  // @ts-ignore
                                  request.csrfToken(),
                                  this.config.cookieOptions
                              )

                              return response.formatter.noContent([])
                          })
                  ]
                : [])
        ]
    }

    cookieOptions(cookieOptions: AuthPluginConfig['cookieOptions']) {
        this.config.cookieOptions = {
            ...this.config.cookieOptions,
            ...cookieOptions
        }

        return this
    }

    private extendGraphQlQueries() {
        const name = this.resources.user.data.snakeCaseName

        const resources: ResourceContract[] = Object.keys(this.resources).map(
            key => (this.resources as any)[key]
        )

        return [
            graphQlQuery(`Login ${name}`)
                .path('login')
                .mutation()
                .handle(async (_, args, ctx, info) => {
                    const payload = await this.login(ctx)

                    const { user } = ctx

                    await Utils.graphql.populateFromResolvedNodes(
                        resources,
                        ctx.manager,
                        ctx.databaseConfig.type!,
                        this.resources.user,
                        Utils.graphql.getParsedInfo(info)[name]?.[
                            'fieldsByTypeName'
                        ]?.[name],
                        [user]
                    )

                    return {
                        ...payload,
                        [this.resources.user.data.snakeCaseName]: user
                    }
                }),
            ...(this.config.httpOnlyCookiesAuth
                ? [
                      graphQlQuery(`Logout ${name}`)
                          .path('logout')
                          .mutation()
                          .handle(async (_, args, ctx) => {
                              return true
                          })
                  ]
                : []),
            graphQlQuery(`Register ${name}`)
                .path('register')
                .mutation()
                .handle(async (_, args, ctx, info) => {
                    const payload = await this.register(ctx)

                    const { user } = ctx

                    await Utils.graphql.populateFromResolvedNodes(
                        resources,
                        ctx.manager,
                        ctx.databaseConfig.type!,
                        this.resources.user,
                        Utils.graphql.getParsedInfo(info)[name]?.[
                            'fieldsByTypeName'
                        ]?.[name],
                        [user]
                    )

                    return {
                        ...payload,
                        [this.resources.user.data.snakeCaseName]: user
                    }
                }),
            graphQlQuery(`Request ${name} password reset`)
                .path('request_password_reset')
                .mutation()
                .handle(async (_, args, ctx, info) => this.forgotPassword(ctx)),
            graphQlQuery(`Reset ${name} password`)
                .path('reset_password')
                .mutation()
                .handle(async (_, args, ctx, info) => this.resetPassword(ctx)),
            graphQlQuery(
                `Get authenticated ${this.resources.user.data.snakeCaseName}`
            )
                .path(`authenticated`)
                .query()
                .authorize(({ user }) =>
                    this.config.rolesAndPermissions
                        ? user && !user.public
                        : !!user
                )
                .handle(async (_, args, ctx, info) => {
                    const { user } = ctx

                    await Utils.graphql.populateFromResolvedNodes(
                        resources,
                        ctx.manager,
                        ctx.databaseConfig.type!,
                        this.resources.user,
                        Utils.graphql.getParsedInfo(info),
                        [user]
                    )

                    return user
                }),
            ...(this.config.twoFactorAuth
                ? [
                      graphQlQuery(`Enable Two Factor Auth`)
                          .path('enable_two_factor_auth')
                          .mutation()
                          .handle(async (_, args, ctx, info) =>
                              this.TwoFactorAuth.enableTwoFactorAuth(ctx)
                          )
                          .authorize(({ user }) =>
                              this.config.rolesAndPermissions
                                  ? user && !user.public
                                  : !!user
                          ),
                      graphQlQuery('Confirm Enable Two Factor Auth')
                          .path('confirm_enable_two_factor_auth')
                          .mutation()
                          .handle(async (_, args, ctx, info) => {
                              await this.TwoFactorAuth.confirmEnableTwoFactorAuth(
                                  ctx
                              )

                              const { user } = ctx

                              await Utils.graphql.populateFromResolvedNodes(
                                  resources,
                                  ctx.manager,
                                  ctx.databaseConfig.type!,
                                  this.resources.user,
                                  Utils.graphql.getParsedInfo(info),
                                  [user]
                              )

                              return user
                          })
                          .authorize(({ user }) =>
                              this.config.rolesAndPermissions
                                  ? user && !user.public
                                  : !!user
                          ),

                      graphQlQuery(`Disable Two Factor Auth`)
                          .path('disable_two_factor_auth')
                          .mutation()
                          .handle(async (_, args, ctx, info) => {
                              await this.TwoFactorAuth.disableTwoFactorAuth(ctx)

                              const { user } = ctx

                              await Utils.graphql.populateFromResolvedNodes(
                                  resources,
                                  ctx.manager,
                                  ctx.databaseConfig.type!,
                                  this.resources.user,
                                  Utils.graphql.getParsedInfo(info),
                                  [user]
                              )

                              return user
                          })
                          .authorize(({ user }) =>
                              this.config.rolesAndPermissions
                                  ? user && !user.public
                                  : !!user
                          )
                  ]
                : []),
            ...(this.config.verifyEmails
                ? [
                      graphQlQuery(`Confirm ${name} Email`)
                          .path('confirm_email')
                          .mutation()
                          .handle(async (_, args, ctx, info) => {
                              await this.confirmEmail(ctx)

                              const { user } = ctx

                              await Utils.graphql.populateFromResolvedNodes(
                                  resources,
                                  ctx.manager,
                                  ctx.databaseConfig.type!,
                                  this.resources.user,
                                  Utils.graphql.getParsedInfo(info),
                                  [user]
                              )

                              return user
                          })
                          .authorize(({ user }) =>
                              this.config.rolesAndPermissions
                                  ? user && !user.public
                                  : !!user
                          ),
                      graphQlQuery(`Resend ${name} Verification Email`)
                          .path('resend_verification_email')
                          .mutation()
                          .handle(async (_, args, ctx, info) =>
                              this.resendVerificationEmail(ctx)
                          )
                  ]
                : []),
            ...(this.socialAuthEnabled()
                ? this.config.separateSocialLoginAndRegister
                    ? [
                          graphQlQuery('Social auth login')
                              .path('social_auth_login')
                              .mutation()
                              .handle(async (_, args, ctx, info) => {
                                  const payload = await this.socialAuth(
                                      ctx,
                                      'login'
                                  )

                                  const { user } = ctx

                                  await Utils.graphql.populateFromResolvedNodes(
                                      resources,
                                      ctx.manager,
                                      ctx.databaseConfig.type!,
                                      this.resources.user,
                                      Utils.graphql.getParsedInfo(info),
                                      [user]
                                  )

                                  return {
                                      ...payload,
                                      [this.resources.user.data
                                          .snakeCaseName]: user
                                  }
                              }),
                          graphQlQuery('Social auth register')
                              .path('social_auth_register')
                              .mutation()
                              .handle(async (_, args, ctx, info) => {
                                  const payload = await this.socialAuth(
                                      ctx,
                                      'register'
                                  )

                                  const { user } = ctx

                                  await Utils.graphql.populateFromResolvedNodes(
                                      resources,
                                      ctx.manager,
                                      ctx.databaseConfig.type!,
                                      this.resources.user,
                                      Utils.graphql.getParsedInfo(info),
                                      [user]
                                  )

                                  return {
                                      ...payload,
                                      [this.resources.user.data
                                          .snakeCaseName]: user
                                  }
                              })
                      ]
                    : [
                          graphQlQuery('Social auth confirm')
                              .path('social_auth_confirm')
                              .mutation()
                              .handle(async (_, args, ctx, info) => {
                                  const payload = await this.socialAuth(ctx)

                                  const { user } = ctx

                                  await Utils.graphql.populateFromResolvedNodes(
                                      resources,
                                      ctx.manager,
                                      ctx.databaseConfig.type!,
                                      this.resources.user,
                                      Utils.graphql.getParsedInfo(info),
                                      [user]
                                  )

                                  return {
                                      ...payload,
                                      [this.resources.user.data
                                          .snakeCaseName]: user
                                  }
                              })
                      ]
                : []),
            ...(this.config.enableRefreshTokens
                ? [
                      graphQlQuery('Refresh token')
                          .path('refresh_token')
                          .mutation()
                          .handle(async (_, args, ctx, info) =>
                              this.handleRefreshTokens(ctx)
                          )
                  ]
                : []),
            ...(this.config.httpOnlyCookiesAuth
                ? [
                      graphQlQuery('Get CSRF Token')
                          .path(`csrf_token`)
                          .query()
                          .handle(async (_, args, ctx, info) => {
                              ctx.res.cookie(
                                  'xsrf-token',
                                  // @ts-ignore
                                  ctx.req.csrfToken()
                              )

                              return true
                          })
                  ]
                : [])
        ]
    }

    private async handleRefreshTokens(ctx: ApiContext) {
        if (!this.config.enableRefreshTokens) {
            return undefined
        }

        if (this.config.httpOnlyCookiesAuth) {
            return undefined
        }

        const { body } = ctx
        const userField = this.resources.user.data.snakeCaseName
        const tokenName = this.resources.token.data.pascalCaseName

        const refreshToken =
            ctx.req.headers[this.config.refreshTokenHeaderName] ||
            (body
                ? body.object
                    ? body.object.refresh_token
                    : body.refresh_token
                : undefined)

        if (!refreshToken) {
            throw ctx.authenticationError('Invalid refresh token.')
        }

        const token: any = await ctx.manager.findOne(
            tokenName,
            {
                token: refreshToken,
                type: TokenTypes.REFRESH
            },
            {
                populate: [
                    `${userField}${
                        this.config.rolesAndPermissions
                            ? `.${this.getRolesAndPermissionsNames()}`
                            : ''
                    }`
                ]
            }
        )

        if (!token) {
            throw ctx.authenticationError('Invalid refresh token.')
        }

        if (token.last_used_at) {
            // This token has been used before.
            // We'll block the user's access to the API by marking this refresh token as compromised.
            // Human interaction is required to lift this limit, something like deleting the compromised tokens.

            ctx.manager.assign(token, {
                compromised_at: Dayjs().format()
            })

            ctx.manager.assign(token[userField], {
                blocked: true
            })

            ctx.manager.persist(token)
            ctx.manager.persist(token[userField])

            await ctx.manager.flush()

            throw ctx.authenticationError('Invalid refresh token.')
        }

        if (!token[userField] || Dayjs(token.expires_on).isBefore(Dayjs())) {
            token && (await ctx.manager.removeAndFlush(token))

            throw ctx.authenticationError('Invalid refresh token.')
        }

        ctx.manager.assign(token, {
            last_used_at: Dayjs().format(),
            expires_at: Dayjs().subtract(1, 'second').format()
        })

        await ctx.manager.persistAndFlush(token)

        ctx.user = token[userField]

        return this.getUserPayload(
            ctx,
            await this.generateRefreshToken(ctx, token.expires_on)
        )
    }

    private getUserPayload(ctx: ApiContext, refreshToken?: string) {
        let userPayload: any = {
            [this.resources.user.data.snakeCaseName]: ctx.user
        }

        if (!this.config.httpOnlyCookiesAuth) {
            userPayload.access_token = this.generateJwt({
                id: ctx.user.id
            })

            userPayload.expires_in = this.config.tokensConfig.accessTokenExpiresIn
        }

        if (this.config.enableRefreshTokens) {
            userPayload.refresh_token = refreshToken
        }

        if (this.config.httpOnlyCookiesAuth) {
            if (ctx.req) {
                ctx.req.session.user = ctx.user
            } else {
                // @ts-ignore
                ctx.session.user = ctx.user
            }
        }

        return userPayload
    }

    private extendGraphQLTypeDefs(gql: any) {
        const snakeCaseName = this.resources.user.data.snakeCaseName

        const cookies = this.config.httpOnlyCookiesAuth

        return gql`
        type register_response {
            ${
                cookies
                    ? ''
                    : `
            access_token: String!
            ${this.config.enableRefreshTokens ? 'refresh_token: String!' : ''}
            expires_in: Int!
            `
            }

            ${snakeCaseName}: ${snakeCaseName}!
        }

        type login_response {
            ${
                cookies
                    ? ''
                    : `
            access_token: String!
            ${this.config.enableRefreshTokens ? 'refresh_token: String!' : ''}
            expires_in: Int!
            `
            }
            ${snakeCaseName}: ${snakeCaseName}!
        }

        input login_input {
            email: String!
            password: String!
        }

        input request_password_reset_input {
            email: String!
        }

        input reset_password_input {
            email: String!
            """ The reset password token sent to ${snakeCaseName}'s email """
            token: String!
            password: String!
        }

        ${
            this.config.twoFactorAuth
                ? `
        type enable_two_factor_auth_response {
            """ The data url for the qr code. Display this in an <img /> tag to be scanned on the authenticator app """
            dataURL: String!
        }

        input confirm_enable_two_factor_auth_input {
            """ The two factor auth token from the ${snakeCaseName}'s authenticator app """
            token: Int!
        }

        input disable_two_factor_auth_input {
            """ The two factor auth token from the ${snakeCaseName}'s authenticator app """
            token: Int!
        }
        `
                : ''
        }

        ${
            this.config.verifyEmails
                ? `
        input confirm_email_input {
            """ The email verification token sent to the ${snakeCaseName}'s email """
            email_verification_token: String!
        }
        `
                : ''
        }

        ${
            this.socialAuthEnabled()
                ? this.config.separateSocialLoginAndRegister
                    ? `
        input social_auth_register_input {
            """ The temporal access token received in query parameter when user is redirected """
            access_token: String!
            extra: JSONObject
        }

        input social_auth_login_input {
            """ The temporal access token received in query parameter when user is redirected """
            access_token: String!
        }
        `
                    : `
        input social_auth_confirm {
            """ The temporal access token received in query parameter when user is redirected """
            access_token: String!
        }
        `
                : ''
        }

        extend input insert_${snakeCaseName}_input {
            password: String!
        }

        ${
            this.config.enableRefreshTokens
                ? `
        input refresh_token_input {
            refresh_token: String
        }
        `
                : ''
        }

        extend type Mutation {
            login(object: login_input!): login_response!
            ${
                cookies
                    ? `
            logout: Boolean!
            `
                    : ''
            }
            register(object: insert_${snakeCaseName}_input!): register_response!
            request_password_reset(object: request_password_reset_input!): Boolean!
            reset_password(object: reset_password_input!): Boolean!
            ${
                this.config.twoFactorAuth
                    ? `
            enable_two_factor_auth: enable_two_factor_auth_response!
            disable_two_factor_auth(object: disable_two_factor_auth_input!): ${snakeCaseName}!
            confirm_enable_two_factor_auth(object: confirm_enable_two_factor_auth_input!): ${snakeCaseName}!
            `
                    : ''
            }
            ${
                this.config.verifyEmails
                    ? `
            confirm_email(object: confirm_email_input!): ${snakeCaseName}!
            resend_verification_email: Boolean
            `
                    : ''
            }
            ${
                this.socialAuthEnabled()
                    ? this.config.separateSocialLoginAndRegister
                        ? `
            social_auth_register(object: social_auth_register_input!): register_response!
            social_auth_login(object: social_auth_login_input!): login_response!
            `
                        : `
                social_auth_confirm(object: social_auth_confirm): login_response!
            `
                    : ''
            }
            ${
                this.config.enableRefreshTokens
                    ? `
            refresh_token(object: refresh_token_input): login_response!
            `
                    : ''
            }
        }

        extend type Query {
            authenticated: ${snakeCaseName}!
            ${
                this.config.httpOnlyCookiesAuth
                    ? `
            csrf_token: Boolean!
            `
                    : ''
            }
        }
    `
    }

    private socialAuthEnabled() {
        return Object.keys(this.config.providers).length > 0
    }

    private getApiPath(path: string) {
        return `/${this.config.apiPath}/${path}`
    }

    private getRouteId(id: string) {
        return this.config.prefix ? `${this.config.prefix}_${id}` : id
    }

    prefix(prefix: string) {
        this.config.prefix = prefix

        return this
    }

    private getRolesAndPermissionsNames() {
        return `${this.resources.role.data.snakeCaseNamePlural}.${this.resources.permission.data.snakeCaseNamePlural}`
    }

    private register = async (ctx: ApiContext) => {
        const { manager, body, emitter } = ctx

        const validator = Utils.validator(
            this.resources.user,
            ctx.manager,
            ctx.req.resources
        )

        let [success, createUserPayload] = await validator.validate(
            body.object ? body.object : body
        )

        if (!success) {
            throw ctx.userInputError('Validation failed.', {
                errors: createUserPayload
            })
        }

        if (this.config.rolesAndPermissions) {
            const authenticatorRole: any = await manager.findOneOrFail(
                this.resources.role.data.pascalCaseName,
                {
                    slug: 'authenticated'
                }
            )

            if (!authenticatorRole) {
                throw {
                    status: 400,
                    message:
                        'The authenticated role must be created to use roles and permissions.'
                }
            }

            createUserPayload.roles = [authenticatorRole.id]
        }

        const UserResource = this.resources.user

        await this.config.beforeRegister(ctx, createUserPayload)

        const user: any = manager.create(
            UserResource.data.pascalCaseName,
            createUserPayload
        )

        await manager.persistAndFlush(user)

        if (this.config.rolesAndPermissions) {
            await manager.populate([user], [this.getRolesAndPermissionsNames()])
        }

        ctx.user = user

        await this.config.afterRegister(ctx, user)

        emitter.emit(USER_EVENTS.REGISTERED, user)

        return this.getUserPayload(ctx, await this.generateRefreshToken(ctx))
    }

    private resendVerificationEmail = async ({
        manager,
        user,
        emitter,
        mailer
    }: ApiContext) => {
        if (!user.email_verification_token) {
            return false
        }

        manager.assign(user, {
            email_verification_token: this.generateRandomToken()
        })

        await manager.persistAndFlush(user)

        emitter.emit(USER_EVENTS.RESENT_VERIFICATION_EMAIL, user)

        return true
    }

    private confirmEmail = async (ctx: ApiContext) => {
        const { manager, body, user } = ctx
        if (
            user.email_verification_token ===
            (body.object
                ? body.object.email_verification_token
                : body.email_verification_token)
        ) {
            manager.assign(user, {
                email_verification_token: null,
                email_verified_at: Dayjs().format()
            })

            await manager.persistAndFlush(user)

            ctx.emitter.emit(USER_EVENTS.VERIFIED_EMAIL, user)

            return user.toJSON()
        }

        throw ctx.userInputError('Invalid email verification token.')
    }

    public getUserPayloadFromProviderData(
        getUserPayloadFromProviderData: AuthPluginConfig['getUserPayloadFromProviderData']
    ) {
        this.config.getUserPayloadFromProviderData = getUserPayloadFromProviderData

        return this
    }

    private socialAuth = async (
        ctx: ApiContext,
        action?: 'login' | 'register'
    ) => {
        const { body, manager } = ctx
        const access_token = body.object
            ? body.object.access_token
            : body.access_token

        if (!access_token) {
            throw ctx.userInputError('Validation failed.', [
                {
                    field: 'access_token',
                    message: 'Invalid access token provided.'
                }
            ])
        }

        let oauthIdentity: any = await manager.findOne(
            this.resources.oauthIdentity.data.pascalCaseName,
            {
                temporal_token: access_token
            }
        )

        if (!oauthIdentity) {
            throw ctx.userInputError('Validation failed.', [
                {
                    field: 'access_token',
                    message: 'Invalid access token provided.'
                }
            ])
        }

        const oauthPayload = JSON.parse(oauthIdentity.payload)

        let user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email: oauthPayload.email
            }
        )

        if (
            !user &&
            action === 'login' &&
            this.config.separateSocialLoginAndRegister
        ) {
            throw ctx.userInputError('Validation failed.', [
                {
                    field: 'email',
                    message: 'Cannot find a user with these credentials.'
                }
            ])
        }

        if (
            user &&
            action === 'register' &&
            this.config.separateSocialLoginAndRegister
        ) {
            throw ctx.userInputError('Validation failed.', [
                {
                    field: 'email',
                    message: `A ${this.resources.user.data.snakeCaseName.toLowerCase()} already exists with email ${
                        oauthIdentity.email
                    }.`
                }
            ])
        }

        if (
            !user &&
            (action === 'register' ||
                !this.config.separateSocialLoginAndRegister)
        ) {
            let createPayload: DataPayload = {
                ...oauthPayload
            }

            if (this.config.verifyEmails) {
                createPayload.email_verified_at = Dayjs().format(
                    'YYYY-MM-DD HH:mm:ss'
                )
                createPayload.email_verification_token = null
            }

            await this.config.beforeRegister(ctx, createPayload as any)

            user = manager.create(
                this.resources.user.data.pascalCaseName,
                createPayload
            )

            await manager.persistAndFlush(user)

            await this.config.afterRegister(ctx, user)
        } else {
            await this.config.beforeLogin(ctx, oauthPayload)
        }

        const belongsToField = this.resources.oauthIdentity.data.fields.find(
            field => field.name === this.resources.user.data.pascalCaseName
        )!

        manager.assign(oauthIdentity, {
            temporal_token: null,
            [belongsToField.databaseField]: user.id
        })

        await manager.flush()

        await this.config.afterLogin(ctx, user)

        ctx.user = user

        return this.getUserPayload(ctx, await this.generateRefreshToken(ctx))
    }

    private logout = async (ctx: ApiContext) => {
        let request = (ctx.req ? ctx.req : ctx) as Request

        return new Promise(resolve => {
            request.session.destroy(error => {
                if (error) {
                    return resolve(false)
                }

                ctx.res.clearCookie('connect.sid')

                return resolve(true)
            })
        })
    }

    private login = async (ctx: ApiContext) => {
        const { manager, body } = ctx
        const [passed, payload] = await this.validate(
            body.object ? body.object : body
        )

        if (!passed) {
            throw ctx.userInputError('Validation failed.', {
                errors: payload
            })
        }

        const { email, password, token } = payload

        const user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email
            },
            {
                populate: this.config.rolesAndPermissions
                    ? [this.getRolesAndPermissionsNames()]
                    : []
            }
        )

        if (!user) {
            throw ctx.authenticationError('Invalid credentials.')
        }

        if (user.blocked) {
            throw ctx.forbiddenError('Your account is temporarily disabled.')
        }

        if (!Bcrypt.compareSync(password, user.password)) {
            throw ctx.authenticationError('Invalid credentials.')
        }

        await this.config.beforeLogin(ctx, user)

        if (this.config.twoFactorAuth && user.two_factor_enabled) {
            const Speakeasy = require('speakeasy')

            if (!token) {
                throw ctx.userInputError(
                    'The two factor authentication token is required.'
                )
            }

            const verified = Speakeasy.totp.verify({
                token,
                encoding: 'base32',
                secret: user.two_factor_secret
            })

            if (!verified) {
                throw ctx.userInputError(
                    'Invalid two factor authentication token.'
                )
            }
        }

        if (this.config.rolesAndPermissions) {
            await manager.populate([user], [this.getRolesAndPermissionsNames()])
        }

        ctx.user = user

        await this.config.afterLogin(ctx, user)

        return this.getUserPayload(ctx, await this.generateRefreshToken(ctx))
    }

    public setAuthUserForPublicRoutes = async (ctx: GraphQLPluginContext) => {
        const { manager, user } = ctx

        if (!this.config.rolesAndPermissions) {
            return
        }

        const publicRole: any = await manager.findOne(
            this.resources.role.data.pascalCaseName,
            {
                slug: 'public'
            },
            {
                populate: [this.getPermissionUserKey()],
                refresh: true
            }
        )

        if (!user && publicRole) {
            ctx.user = {
                public: true,
                [this.getRoleUserKey()]: [publicRole as UserRole],
                [this.getPermissionUserKey()]: publicRole[
                    this.getPermissionUserKey()
                ]
                    .toJSON()
                    .map((permission: any) => permission.slug)
            } as any
        }
    }

    private ensureAuthUserIsNotBlocked = async (ctx: ApiContext) => {
        if (!ctx.user || (ctx.user && ctx.user.public)) {
            return
        }

        if (ctx.user.blocked) {
            throw ctx.forbiddenError('Your account is temporarily disabled.')
        }
    }

    private populateContextFromToken = async (
        token: string | undefined,
        ctx: ApiContext
    ) => {
        const { manager } = ctx

        try {
            let id

            if (!this.config.httpOnlyCookiesAuth) {
                const payload = Jwt.verify(
                    token!,
                    this.config.tokensConfig.secretKey
                ) as JwtPayload

                id = payload.id
            } else {
                id = ctx.req.session?.user?.id
            }

            if (!id) {
                return
            }

            const user: any = await manager.findOne(
                this.resources.user.data.pascalCaseName,
                {
                    id
                },
                {
                    populate: this.config.rolesAndPermissions
                        ? [this.getRolesAndPermissionsNames()]
                        : []
                }
            )

            if (this.config.rolesAndPermissions && user) {
                user[this.getPermissionUserKey()] = user[this.getRoleUserKey()]
                    ?.toJSON()
                    .reduce(
                        (acc: string[], role: UserRole) => [
                            ...acc,
                            ...(role as any)[this.getPermissionUserKey()].map(
                                (p: any) => p.slug
                            )
                        ],
                        []
                    )
            }

            ctx.user = user
        } catch (error) {}
    }

    private getRoleUserKey() {
        return this.resources.role.data.snakeCaseNamePlural
    }

    private getPermissionUserKey() {
        return this.resources.permission.data.snakeCaseNamePlural
    }

    public getAuthUserFromContext = async (ctx: ApiContext) => {
        const { req } = ctx

        const { headers } = req
        const [, token] = (headers['authorization'] || '').split('Bearer ')

        return this.populateContextFromToken(token, ctx)
    }

    protected forgotPassword = async ({
        body,
        manager,
        userInputError
    }: ApiContext) => {
        const { email } = await validateAll(body.object ? body.object : body, {
            email: 'required|email'
        })

        const existingUser: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email
            }
        )
        const existingPasswordReset = await manager.findOne(
            this.resources.passwordReset.data.pascalCaseName,
            {
                email
            }
        )

        if (!existingUser) {
            throw userInputError('Validation failed.', {
                errors: [
                    {
                        field: 'email',
                        message: 'Invalid email address.'
                    }
                ]
            })
        }

        const token = this.generateRandomToken()

        const expiresAt = Dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')

        if (existingPasswordReset) {
            // make sure it has not expired
            manager.assign(existingPasswordReset, {
                token,
                expires_at: expiresAt
            })

            manager.persist(existingPasswordReset)
        } else {
            manager.persist(
                manager.create(
                    this.resources.passwordReset.data.pascalCaseName,
                    {
                        email,
                        token,
                        expires_at: expiresAt
                    }
                )
            )
        }

        await manager.flush()

        return true
    }

    protected resetPassword = async ({
        body,
        manager,
        userInputError
    }: ApiContext) => {
        const { token, password } = await validateAll(
            body.object ? body.object : body,
            {
                token: 'required|string',
                password: 'required|string|min:8'
            }
        )

        let existingPasswordReset: any = await manager.findOne(
            this.resources.passwordReset.data.pascalCaseName,
            {
                token
            }
        )

        if (!existingPasswordReset) {
            throw userInputError('Validation failed.', {
                errors: [
                    {
                        field: 'token',
                        message: 'Invalid reset token.'
                    }
                ]
            })
        }

        if (Dayjs(existingPasswordReset.expires_at).isBefore(Dayjs())) {
            throw userInputError('Validation failed.', {
                errors: [
                    {
                        field: 'token',
                        message: 'Invalid reset token.'
                    }
                ]
            })
        }

        let user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email: existingPasswordReset.email
            }
        )

        if (!user) {
            manager.removeAndFlush(existingPasswordReset)

            return false
        }

        manager.assign(user, {
            password
        })

        manager.persist(user)
        manager.remove(existingPasswordReset)

        await manager.flush()

        // TODO: Send an email to the user notifying them
        // that their password was reset.

        return true
    }

    protected validate = async (data: AuthData, registration = false) => {
        let rules: {
            [key: string]: string
        } = {
            email: 'required|email',
            password: 'required|min:8'
        }

        try {
            const payload = await validateAll(data, rules, {
                'email.required': 'The email is required.',
                'password.required': 'The password is required.',
                'name.required': 'The name is required.'
            })

            return [true, payload]
        } catch (errors) {
            return [false, errors]
        }
    }

    public async generateRefreshToken(
        ctx: GraphQLPluginContext,
        previousTokenExpiry?: string
    ): Promise<string | undefined> {
        if (!this.config.enableRefreshTokens) {
            return undefined
        }

        if (this.config.httpOnlyCookiesAuth) {
            return undefined
        }

        const plainTextToken = this.generateRandomToken(64)

        // Expire all existing refresh tokens for this user.
        await ctx.manager.nativeUpdate(
            this.resources.token.data.pascalCaseName,
            {
                [this.resources.user.data.snakeCaseName]: ctx.user.id
            } as any,
            {
                expires_at: Dayjs().subtract(1, 'second').format(),
                last_used_at: Dayjs().subtract(1, 'second').format()
            }
        )

        const entity = ctx.manager.create(
            this.resources.token.data.pascalCaseName,
            {
                token: plainTextToken,
                [this.resources.user.data.snakeCaseName]: ctx.user.id,
                type: TokenTypes.REFRESH,
                expires_at: previousTokenExpiry
                    ? previousTokenExpiry
                    : Dayjs().add(
                          this.config.tokensConfig.refreshTokenExpiresIn,
                          'second'
                      )
            }
        )

        await ctx.manager.persistAndFlush(entity)

        // TODO:
        // 1. Encrypt the token using application key
        // 2. Create JWT with token as payload
        // 3. Save Token to database.
        // 4. To verify token, decode JWT
        // 5. Decrypt token from JWT
        // 6. Query the database for the refresh token
        return plainTextToken
    }

    private generateJwt(payload: DataPayload) {
        return Jwt.sign(payload, this.config.tokensConfig.secretKey, {
            expiresIn: this.config.tokensConfig.accessTokenExpiresIn
        })
    }

    public generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex')
    }

    public social(provider: SupportedSocialProviders, config: GrantConfig) {
        this.config.providers[provider] = {
            ...config,
            callback: config.callback
                ? config.callback
                : `/${this.config.apiPath}/${provider}/callback`,

            scope:
                config.scope && config.scope.length > 0
                    ? config.scope
                    : defaultProviderScopes(provider)
        }

        return this
    }
}

export const auth = () => new Auth()
export { USER_EVENTS } from './config'
