import Dayjs from 'dayjs'
import Uniqid from 'uniqid'
import Bcrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import Randomstring from 'randomstring'
import { validateAll } from 'indicative/validator'
import { Request, Response, NextFunction, response } from 'express'
import {
    plugin,
    resource,
    text,
    json,
    textarea,
    belongsTo,
    belongsToMany,
    dateTime,
    HookFunction,
    DataPayload,
    InBuiltEndpoints,
    FieldContract,
    hasMany,
    ResourceContract,
    boolean,
    TensieContext,
    Resolvers,
    MiddlewareGenerator,
    GraphQlMiddleware,
    GraphQLPluginContext
} from '@tensei/common'

import {
    AuthData,
    GrantConfig,
    AuthResources,
    AuthPluginConfig,
    SupportedSocialProviders,
    defaultProviderScopes
} from './config'
import SocialAuthCallbackController from './controllers/SocialAuthCallbackController'

import { setup } from './setup'
import { UserRole } from '@tensei/common'
import { Permission } from '@tensei/common'
import { graphQlQuery } from '@tensei/common'
import { ApiContext } from '@tensei/common'
import { GraphQlQueryContract } from '@tensei/common'
import { route } from '@tensei/common'
import { snakeCase } from 'change-case'

type ResourceShortNames =
    | 'user'
    | 'team'
    | 'role'
    | 'oauthIdentity'
    | 'permission'
    | 'teamInvite'
    | 'passwordReset'

type JwtPayload = {
    id: string
    refresh?: boolean
}

type AuthSetupFn = (resources: AuthResources) => any

class Auth {
    private config: AuthPluginConfig & {
        setupFn: AuthSetupFn
    } = {
        profilePictures: false,
        userResource: 'User',
        roleResource: 'Role',
        permissionResource: 'Permission',
        passwordResetResource: 'Password Reset',
        fields: [],
        apiPath: 'auth',
        setupFn: () => this,
        jwt: {
            expiresIn: 60 * 60,
            secretKey: process.env.JWT_SECRET || 'auth-secret-key',
            refreshTokenExpiresIn: 60 * 60 * 24 * 7
        },
        cookieOptions: {},
        refreshTokenCookieName: '___refresh__token',
        teams: false,
        teamFields: [],
        twoFactorAuth: false,
        verifyEmails: false,
        skipWelcomeEmail: false,
        rolesAndPermissions: false,
        providers: {}
    }

    private resources: {
        user: ResourceContract
        team: ResourceContract
        role: ResourceContract
        oauthIdentity: ResourceContract
        permission: ResourceContract
        teamInvite: ResourceContract
        passwordReset: ResourceContract
    } = {} as any

    public constructor() {
        this.refreshResources()
    }

    private refreshResources() {
        this.resources.user = this.userResource()
        this.resources.team = this.teamResource()
        this.resources.role = this.roleResource()
        this.resources.oauthIdentity = this.oauthResource()
        this.resources.permission = this.permissionResource()
        this.resources.teamInvite = this.teamInviteResource()
        this.resources.passwordReset = this.passwordResetResource()

        this.config.setupFn(this.resources)
    }

    public afterUpdateUser(hook: HookFunction) {
        this.config.afterUpdateUser = hook

        return this
    }

    public beforeLoginUser(hook: HookFunction) {
        this.config.beforeLoginUser = hook

        return this
    }

    public afterLoginUser(hook: HookFunction) {
        this.config.afterLoginUser = hook

        return this
    }

    public setup(fn: AuthSetupFn) {
        this.config.setupFn = fn

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

    public jwt(config: Partial<AuthPluginConfig['jwt']>) {
        this.config.jwt = {
            ...this.config.jwt,
            ...config
        }

        return this
    }

    public tokenExpiresIn(tokenExpiresIn: number) {
        this.config.jwt.expiresIn = tokenExpiresIn

        return this
    }

    public tokenSecretKey(secret: string) {
        this.config.jwt.secretKey = secret

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

    public teamFields(fields: AuthPluginConfig['teamFields']) {
        this.config.teamFields = fields

        return this
    }

    public twoFactorAuth() {
        this.config.twoFactorAuth = true

        return this
    }

    public role(name: string) {
        this.config.roleResource = name

        return this
    }

    public permission(name: string) {
        this.config.permissionResource = name

        return this
    }

    public teams() {
        this.config.teams = true

        return this
    }

    public rolesAndPermissions() {
        this.config.rolesAndPermissions = true

        return this
    }

    private userResource() {
        let passwordField = text('Password')

        let socialFields: FieldContract[] = []

        if (Object.keys(this.config.providers).length === 0) {
            passwordField = passwordField.notNullable()
        } else {
            socialFields = [hasMany(this.resources.oauthIdentity.data.name)]
            passwordField = passwordField.nullable()
        }

        const userResource = resource(this.config.userResource)
            .fields([
                text('Email')
                    .unique()
                    .searchable()
                    .notNullable()
                    .creationRules('required|email'),
                passwordField
                    .hidden()
                    .htmlAttributes({
                        type: 'password'
                    })
                    .creationRules('required')
                    .onlyOnForms()
                    .hideOnUpdate(),
                ...socialFields,
                ...(this.config.rolesAndPermissions
                    ? [belongsToMany(this.config.roleResource)]
                    : []),
                ...(this.config.twoFactorAuth
                    ? [
                          boolean('Two Factor Enabled')
                              .hideOnCreate()
                              .hideOnUpdate()
                              .hideOnIndex()
                              .hideOnDetail()
                              .nullable(),
                          text('Two Factor Secret')
                              .hidden()
                              .hideOnIndex()
                              .hideOnCreate()
                              .hideOnUpdate()
                              .hideOnDetail()
                              .nullable()
                      ]
                    : []),
                ...this.config.fields,
                ...(this.config.verifyEmails
                    ? [
                          dateTime('Email Verified At')
                              .hideOnIndex()
                              .hideOnDetail()
                              .nullable(),
                          text('Email Verification Token')
                              .hidden()
                              .nullable()
                              .hideOnCreate()
                              .hideOnIndex()
                              .hideOnUpdate()
                              .hideOnDetail()
                      ]
                    : [])
            ])
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
            .beforeUpdate(async ({ entity, em, changeSet }) => {
                if (changeSet?.payload.password) {
                    em.assign(entity, {
                        password: Bcrypt.hashSync(changeSet.payload.password)
                    })
                }
            })
            .group('Users & Permissions')

        return userResource
    }

    private teamResource() {
        return resource('Team')
            .fields([
                text('Name').unique(),
                belongsTo(this.config.userResource),
                belongsToMany(this.config.userResource),
                ...this.config.teamFields
            ])
            .hideFromNavigation()
    }

    private teamInviteResource() {
        return resource('Team Invite').fields([
            text('Email'),
            text('Role'),
            text('Token').unique().rules('required'),
            belongsTo(this.resources.team.data.name),
            belongsTo(this.config.userResource)
        ])
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
            .displayField('name')
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
                belongsToMany(this.config.permissionResource)
            ])
            .displayField('name')
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
            .hideFromApi()
    }

    private oauthResource() {
        return resource('Oauth Identity')
            .hideFromNavigation()
            .fields([
                belongsTo(this.config.userResource).nullable(),
                textarea('Access Token').hidden().hideFromApi(),
                text('Email').hidden(),
                textarea('Temporal Token').nullable().hidden(),
                json('Payload').hidden().hideFromApi(),
                text('Provider').rules('required'),
                text('Provider User ID').hidden()
            ])
    }

    public plugin() {
        return plugin('Auth')
            .beforeDatabaseSetup(
                ({
                    gql,
                    pushResource,
                    databaseConfig,
                    extendGraphQlTypeDefs,
                    extendGraphQlQueries,
                    extendGraphQlMiddleware
                }) => {
                    this.refreshResources()

                    pushResource(this.resources.user)
                    pushResource(this.resources.passwordReset)

                    if (this.config.rolesAndPermissions) {
                        pushResource(this.resources.role)

                        pushResource(this.resources.permission)
                    }

                    if (this.config.teams) {
                        pushResource(this.resources.team)

                        pushResource(this.resources.teamInvite)
                    }

                    if (Object.keys(this.config.providers).length > 0) {
                        pushResource(this.resources.oauthIdentity)
                    }

                    if (Object.keys(this.config.providers).length > 0) {
                        databaseConfig.entities = [
                            ...(databaseConfig.entities || []),
                            require('express-session-mikro-orm').generateSessionEntity()
                        ]
                    }

                    extendGraphQlTypeDefs([this.extendGraphQLTypeDefs(gql)])
                    extendGraphQlQueries(this.extendGraphQlQueries())

                    extendGraphQlMiddleware([
                        graphQlQueries => {
                            const resolverAuthorizers: Resolvers = {
                                Query: {},
                                Mutation: {}
                            }

                            const getAuthorizer = (
                                query: GraphQlQueryContract
                            ): GraphQlMiddleware => {
                                return async (
                                    resolve,
                                    parent,
                                    args,
                                    context,
                                    info
                                ) => {
                                    await this.getAuthUserFromContext(context)
                                    await this.setAuthUserForPublicRoutes(
                                        context
                                    )
                                    await this.authorizeResolver(context, query)

                                    const result = await resolve(
                                        parent,
                                        args,
                                        context,
                                        info
                                    )

                                    return result
                                }
                            }

                            graphQlQueries.forEach(query => {
                                if (query.config.type === 'QUERY') {
                                    ;(resolverAuthorizers.Query as any)[
                                        query.config.path
                                    ] = getAuthorizer(query)
                                }

                                if (query.config.type === 'MUTATION') {
                                    ;(resolverAuthorizers.Mutation as any)[
                                        query.config.path
                                    ] = getAuthorizer(query)
                                }
                            })

                            return resolverAuthorizers
                        }
                    ])

                    return Promise.resolve()
                }
            )

            .afterDatabaseSetup(async config => {
                if (this.config.rolesAndPermissions) {
                    await setup(config, [
                        this.resources.role,
                        this.resources.permission
                    ])
                }
            })

            .beforeCoreRoutesSetup(async config => {
                const { app, serverUrl, clientUrl, extendRoutes } = config

                extendRoutes(this.extendRoutes())

                if (Object.keys(this.config.providers).length > 0) {
                    const grant = require('grant')
                    const ExpressSession = require('express-session')

                    const Store = require('express-session-mikro-orm').StoreFactory(
                        ExpressSession
                    )

                    app.use(
                        ExpressSession({
                            store: new Store({
                                orm: config.orm
                            }),
                            resave: false,
                            saveUninitialized: false,
                            secret: process.env.GRANT_SESSION_SECRET || 'grant'
                        })
                    )

                    Object.keys(this.config.providers).forEach(provider => {
                        const providerConfig = this.config.providers[provider]
                        const clientCallback =
                            providerConfig.clientCallback || ''

                        this.config.providers[provider] = {
                            ...providerConfig,
                            redirect_uri: `${serverUrl}/connect/${provider}/callback`,
                            clientCallback: clientCallback.startsWith('http')
                                ? clientCallback
                                : `${clientUrl}${
                                      clientCallback.startsWith('/') ? '/' : ''
                                  }${clientCallback}`
                        }
                    })

                    app.use(grant.express()(this.config.providers))

                    app.get(
                        `/${this.config.apiPath}/:provider/callback`,
                        SocialAuthCallbackController.connect({
                            ...this.config,
                            resources: this.resources
                        })
                    )
                }

                return {}
            })
            .afterCoreRoutesSetup(
                async ({ graphQlQueries, routes, apiPath, app }) => {
                    graphQlQueries.forEach(query => {
                        if (query.config.resource) {
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
                                [
                                    `insert_${plural}`,
                                    `insert_${singular}`
                                ].includes(path)
                            ) {
                                return query.authorize(({ user }) =>
                                    user.permissions!.includes(`insert:${slug}`)
                                )
                            }

                            if (
                                [
                                    `delete_${plural}`,
                                    `delete_${singular}`
                                ].includes(path)
                            ) {
                                return query.authorize(({ user }) =>
                                    user.permissions!.includes(`delete:${slug}`)
                                )
                            }

                            if (
                                [
                                    `update_${plural}`,
                                    `update_${singular}`
                                ].includes(path)
                            ) {
                                return query.authorize(({ user }) =>
                                    user.permissions!.includes(`update:${slug}`)
                                )
                            }

                            if (path === plural) {
                                return query.authorize(({ user }) =>
                                    user.permissions!.includes(`fetch:${slug}`)
                                )
                            }

                            if (path === singular) {
                                return query.authorize(({ user }) =>
                                    user.permissions!.includes(`show:${slug}`)
                                )
                            }
                        }
                    })

                    app.use(async (request, response, next) => {
                        await this.getAuthUserFromContext(request as any)

                        return next()
                    })

                    app.use(async (request, response, next) => {
                        await this.setAuthUserForPublicRoutes(request as any)

                        return next()
                    })

                    routes.forEach(route => {
                        route.middleware([
                            async (request, response, next) => {
                                const authorizers = await Promise.all(
                                    route.config.authorize.map(fn =>
                                        fn(request as any)
                                    )
                                )

                                if (
                                    authorizers.filter(authorized => authorized)
                                        .length !==
                                    route.config.authorize.length
                                ) {
                                    return response.status(401).json({
                                        message: `Unauthorized.`
                                    })
                                }

                                next()
                            }
                        ])
                        if (route.config.resource) {
                            const {
                                resource,
                                path,
                                type,
                                internal
                            } = route.config

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
                                path === `/${apiPath}/${slugPlural}` &&
                                type === 'POST' &&
                                internal
                            ) {
                                return route.authorize(({ user }) =>
                                    user.permissions!.includes(
                                        `insert:${slugSingular}`
                                    )
                                )
                            }

                            if (
                                path === `/${apiPath}/${slugPlural}` &&
                                type === 'GET' &&
                                internal
                            ) {
                                return route.authorize(({ user }) =>
                                    user.permissions!.includes(
                                        `fetch:${slugSingular}`
                                    )
                                )
                            }

                            if (
                                path === `/${apiPath}/${slugPlural}/:id` &&
                                type === 'GET' &&
                                internal
                            ) {
                                return route.authorize(({ user }) =>
                                    user.permissions!.includes(
                                        `show:${slugSingular}`
                                    )
                                )
                            }

                            if (
                                [
                                    `/${apiPath}/${slugPlural}/:id`,
                                    `/${apiPath}/${slugPlural}`
                                ].includes(path) &&
                                ['PUT', 'PATCH'].includes(type) &&
                                internal
                            ) {
                                return route.authorize(({ user }) =>
                                    user.permissions!.includes(
                                        `update:${slugSingular}`
                                    )
                                )
                            }

                            if (
                                [
                                    `/${apiPath}/${slugPlural}/:id`,
                                    `/${apiPath}/${slugPlural}`
                                ].includes(path) &&
                                type === 'DELETE' &&
                                internal
                            ) {
                                return route.authorize(({ user }) =>
                                    user.permissions!.includes(
                                        `delete:${slugSingular}`
                                    )
                                )
                            }
                        }
                    })
                }
            )
    }

    private getRegistrationFieldsDocs() {
        const properties: any = {}

        // TODO: Calculate and push new registration fields to be exposed to API

        return properties
    }

    private extendRoutes() {
        const name = this.resources.user.data.slugSingular

        const extend = {
            tags: ['Auth']
        }

        return [
            route(`Login ${name}`)
                .path(this.getApiPath('login'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Login an existing ${name}.`,
                        parameters: [
                            {
                                required: true,
                                type: 'object',
                                name: 'body',
                                in: 'body',
                                schema: {
                                    $ref: `#/definitions/LoginInput`
                                }
                            }
                        ],
                        definitions: {
                            LoginInput: {
                                type: 'object',
                                properties: {
                                    email: {
                                        required: true,
                                        type: 'string',
                                        format: 'email'
                                    },
                                    password: {
                                        required: true,
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    }
                })
                .handle(async (request, { formatter: { ok, unprocess } }) => {
                    try {
                        return ok(await this.login(request as any))
                    } catch (error) {
                        return unprocess(error)
                    }
                }),
            route(`Register ${name}`)
                .path(this.getApiPath('register'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Register a new ${name}.`,
                        parameters: [
                            {
                                required: true,
                                type: 'object',
                                name: 'body',
                                in: 'body',
                                schema: {
                                    $ref: `#/definitions/RegisterInput`
                                }
                            }
                        ],
                        definitions: {
                            RegisterInput: {
                                type: 'object',
                                properties: {
                                    email: {
                                        required: true,
                                        type: 'string',
                                        format: 'email'
                                    },
                                    password: {
                                        required: true,
                                        type: 'string'
                                    },
                                    ...this.getRegistrationFieldsDocs()
                                }
                            }
                        }
                    }
                })
                .handle(
                    async (request, { formatter: { created, unprocess } }) => {
                        try {
                            return created(await this.register(request as any))
                        } catch (error) {
                            return unprocess(error)
                        }
                    }
                ),
            route(`Request password reset`)
                .path(this.getApiPath('passwords/email'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Request a password reset for a ${name} using the ${name} email.`,
                        parameters: [
                            {
                                required: true,
                                type: 'object',
                                name: 'body',
                                in: 'body',
                                schema: {
                                    $ref: `#/definitions/RequestPasswordInput`
                                }
                            }
                        ],
                        definitions: {
                            RequestPasswordInput: {
                                properties: {
                                    email: {
                                        type: 'string',
                                        required: true,
                                        format: 'email'
                                    }
                                }
                            }
                        }
                    }
                })
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.forgotPassword(request as any)
                    )
                ),

            route(`Reset password`)
                .path(this.getApiPath('passwords/reset'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Reset a ${name} password using a password reset token.`,
                        parameters: [
                            {
                                required: true,
                                type: 'object',
                                name: 'body',
                                in: 'body',
                                schema: {
                                    $ref: `#/definitions/ResetPasswordInput`
                                }
                            }
                        ],
                        definitions: {
                            ResetPasswordInput: {
                                properties: {
                                    password: {
                                        type: 'string',
                                        required: true
                                    },
                                    token: {
                                        type: 'string',
                                        required: true,
                                        description: `This token was sent to the ${name}'s email. Provide it here to reset the ${name}'s password.`
                                    }
                                }
                            }
                        }
                    }
                })
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.resetPassword(request as any)
                    )
                ),
            route(`Enable Two Factor Auth`)
                .path(this.getApiPath('two-factor/enable'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Enable two factor authentication for an existing ${name}.`
                    }
                })
                .authorize(({ user }) => user && !user.public)
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.enableTwoFactorAuth(request as any)
                    )
                ),
            route(`Confirm Enable Two Factor Auth`)
                .path(this.getApiPath('two-factor/enable/confirm'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Confirm enable two factor authentication for an existing ${name}.`,
                        description: `This endpoint confirms enabling 2fa for an account. A previous call to /${this.config.apiPath}/two-factor/enable is required to generate a 2fa secret for the ${name}'s account.`
                    }
                })
                .authorize(({ user }) => user && !user.public)
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.enableTwoFactorAuth(request as any)
                    )
                ),
            route(`Disable Two Factor Auth`)
                .path(this.getApiPath('two-factor/disable'))
                .post()
                .authorize(({ user }) => user && !user.public)
                .extend({
                    docs: {
                        ...extend,
                        summary: `Disable two factor authentication for an existing ${name}.`
                    }
                })
                .authorize(({ user }) => !!user)
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.disableTwoFactorAuth(request as any)
                    )
                ),
            route(`Get authenticated ${name}`)
                .path(this.getApiPath('me'))
                .get()
                .authorize(({ user }) => user && !user.public)
                .extend({
                    docs: {
                        ...extend,
                        summary: `Get the authenticated ${name} from a valid JWT.`,
                        security: [
                            {
                                Bearer: []
                            }
                        ]
                    }
                })
                .handle(
                    async ({ user }, { formatter: { ok, unauthorized } }) =>
                        user
                ),
            route(`Resend Verification email`)
                .path(this.getApiPath('verification/resend'))
                .post()
                .authorize(({ user }) => user && !user.public)
                .extend({
                    docs: {
                        ...extend,
                        summary: `Resend verification email to ${name} email.`
                    }
                })
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.resendVerificationEmail(request as any)
                    )
                ),
            route(`Social Auth Login`)
                .path(this.getApiPath('social/login'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Login a ${name} via a social provider.`,
                        description: `This operation requires an access_token gotten after a redirect from the social provider.`
                    }
                })
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.socialAuth(request as any, 'login')
                    )
                ),
            route(`Social Auth Register`)
                .path(this.getApiPath('social/register'))
                .post()
                .extend({
                    docs: {
                        ...extend,
                        summary: `Register a ${name} via a social provider.`,
                        description: `This operation requires an access_token gotten after a redirect from the social provider.`
                    }
                })
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.socialAuth(request as any, 'register')
                    )
                ),
            route('Refresh Token')
                .path(this.getApiPath('refresh-token'))
                .post()
                .authorize(({ user }) => user && !user.public)
                .extend({
                    docs: {
                        ...extend,
                        summary: `Request a new (access token) using a refresh token.`,
                        description: `The refresh token is set in cookies response for all endpoints that return an access token (login, register).`,
                        parameters: [
                            {
                                name: this.config.refreshTokenCookieName,
                                required: true,
                                in: 'cookie'
                            }
                        ]
                    }
                })
                .handle(
                    async (request, { formatter: { ok, unauthorized } }) => {
                        try {
                            return ok(
                                await this.handleRefreshTokens(request as any)
                            )
                        } catch (error) {
                            return unauthorized({
                                message:
                                    error.message || 'Invalid refresh token.'
                            })
                        }
                    }
                ),
            route('Remove refresh Token')
                .path(this.getApiPath('refresh-token'))
                .delete()
                .authorize(({ user }) => user && !user.public)
                .extend({
                    docs: {
                        ...extend,
                        summary: `Invalidate a refresh token.`,
                        description: `Sets the refresh token cookie to an invalid value and expires it.`,
                        parameters: [
                            {
                                name: this.config.refreshTokenCookieName,
                                required: true,
                                in: 'cookie'
                            }
                        ]
                    }
                })
                .handle(async (request, response) =>
                    response.formatter.ok(
                        await this.removeRefreshTokens(request as any)
                    )
                )
        ]
    }

    cookieOptions(cookieOptions: AuthPluginConfig['cookieOptions']) {
        this.config.cookieOptions = cookieOptions

        return this
    }

    private setRefreshToken(ctx: ApiContext) {
        ctx.res.cookie(
            this.config.refreshTokenCookieName,
            this.generateJwt(
                {
                    id: ctx.user.id,
                    refresh: true
                },
                true
            ),
            {
                ...this.config.cookieOptions,
                httpOnly: true,
                maxAge: this.config.jwt.refreshTokenExpiresIn * 1000
            }
        )
    }

    private extendGraphQlQueries() {
        const name = this.resources.user.data.snakeCaseName

        return [
            graphQlQuery(`Login ${name}`)
                .path(`login_${name}`)
                .mutation()
                .handle(async (_, args, ctx, info) => this.login(ctx)),
            graphQlQuery(`Register ${name}`)
                .path(`register_${name}`)
                .mutation()
                .handle(async (_, args, ctx, info) => this.register(ctx)),
            graphQlQuery(`Request password reset`)
                .path('request_password_reset')
                .mutation()
                .handle(async (_, args, ctx, info) => this.forgotPassword(ctx)),
            graphQlQuery(`Reset password`)
                .path('reset_password')
                .mutation()
                .handle(async (_, args, ctx, info) => this.resetPassword(ctx)),
            graphQlQuery(`Enable Two Factor Auth`)
                .path('enable_two_factor_auth')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.enableTwoFactorAuth(ctx)
                )
                .authorize(({ user }) => !user.public),
            graphQlQuery('Confirm Enable Two Factor Auth')
                .path('confirm_enable_two_factor_auth')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.confirmEnableTwoFactorAuth(ctx)
                )
                .authorize(({ user }) => !user.public),
            graphQlQuery(
                `Get authenticated ${this.resources.user.data.snakeCaseName}`
            )
                .path(`authenticated_${this.resources.user.data.snakeCaseName}`)
                .query()
                .handle(async (_, args, ctx, info) => {
                    if (!ctx.user || ctx.user.public)
                        throw ctx.authenticationError()

                    return ctx.user
                }),
            graphQlQuery(`Disable Two Factor Auth`)
                .path('disable_two_factor_auth')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.disableTwoFactorAuth(ctx)
                )
                .authorize(({ user }) => !user.public),
            graphQlQuery('Confirm Email')
                .path('confirm_email')
                .mutation()
                .handle(async (_, args, ctx, info) => this.confirmEmail(ctx))
                .authorize(({ user }) => !user.public),
            graphQlQuery('Resend Verification Email')
                .path('resend_verification_email')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.resendVerificationEmail(ctx)
                ),
            graphQlQuery('Social auth login')
                .path('social_auth_login')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.socialAuth(ctx, 'login')
                ),
            graphQlQuery('Social auth register')
                .path('social_auth_register')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.socialAuth(ctx, 'register')
                ),
            graphQlQuery('Refresh token')
                .path('refresh_token')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.handleRefreshTokens(ctx)
                ),
            graphQlQuery('Remove refresh token')
                .path('remove_refresh_token')
                .mutation()
                .handle(async (_, args, ctx, info) =>
                    this.removeRefreshTokens(ctx)
                )
        ]
    }

    private async removeRefreshTokens(ctx: ApiContext) {
        ctx.res.cookie(this.config.refreshTokenCookieName, '', {
            ...this.config.cookieOptions,
            httpOnly: true,
            maxAge: 0
        })

        return true
    }

    private async handleRefreshTokens(ctx: ApiContext) {
        const refreshToken = ctx.req.cookies[this.config.refreshTokenCookieName]

        if (!refreshToken) {
            throw ctx.authenticationError('Invalid refresh token.')
        }

        let tokenPayload: JwtPayload | undefined = undefined

        try {
            tokenPayload = Jwt.verify(
                refreshToken,
                this.config.jwt.secretKey
            ) as JwtPayload
        } catch (error) {}

        if (!tokenPayload || !tokenPayload.refresh) {
            throw ctx.authenticationError('Invalid refresh token.')
        }

        const user: any = await ctx.manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                id: tokenPayload.id
            },
            {
                populate: this.config.rolesAndPermissions
                    ? ['roles.permissions']
                    : []
            }
        )

        ctx.user = user

        return this.getUserPayload(ctx)
    }

    private getUserPayload(ctx: ApiContext) {
        return {
            token: this.generateJwt({
                id: ctx.user.id
            }),
            expires_in: this.config.jwt.expiresIn,
            [this.resources.user.data.snakeCaseName]: ctx.user
        }
    }

    private extendGraphQLTypeDefs(gql: any) {
        const snakeCaseName = this.resources.user.data.snakeCaseName

        return gql`
        type register_${snakeCaseName}_response {
            token: String!
            expires_in: Int!
            ${snakeCaseName}: ${snakeCaseName}!
        }

        type login_${snakeCaseName}_response {
            token: String!
            expires_in: Int!
            ${snakeCaseName}: ${snakeCaseName}!
        }

        input login_${snakeCaseName}_input {
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

        input confirm_email_input {
            """ The email verification token sent to the ${snakeCaseName}'s email """
            email_verification_token: String!
        }

        input social_auth_register_input {
            """ The temporal access token received in query parameter when user is redirected """
            access_token: String!
        }

        input social_auth_login_input {
            """ The temporal access token received in query parameter when user is redirected """
            access_token: String!
        }

        extend input create_${snakeCaseName}_input {
            password: String!
        }

        extend type Mutation {
            login_${snakeCaseName}(object: login_${snakeCaseName}_input!): login_${snakeCaseName}_response!
            register_${snakeCaseName}(object: create_${snakeCaseName}_input!): register_${snakeCaseName}_response!
            request_password_reset(object: request_password_reset_input!): Boolean!
            reset_password(object: reset_password_input!): Boolean!
            enable_two_factor_auth: enable_two_factor_auth_response!
            disable_two_factor_auth(object: disable_two_factor_auth_input!): ${snakeCaseName}!
            confirm_enable_two_factor_auth(object: confirm_enable_two_factor_auth_input!): ${snakeCaseName}!
            confirm_email(object: confirm_email_input!): ${snakeCaseName}!
            resend_verification_email: Boolean!
            social_auth_register(object: social_auth_register_input!): register_${snakeCaseName}_response!
            social_auth_login(object: social_auth_login_input!): login_${snakeCaseName}_response!
            refresh_token: login_${snakeCaseName}_response!
            remove_refresh_token: Boolean!
        }

        extend type Query {
            authenticated_${snakeCaseName}: ${snakeCaseName}!
        }
    `
    }

    private getApiPath(path: string) {
        return `/${this.config.apiPath}/${path}`
    }

    private register = async (ctx: ApiContext) => {
        const { manager, mailer, body } = ctx
        let createUserPayload = await this.validate(
            body.object ? body.object : body
        )

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

        const user: any = manager.create(
            UserResource.data.pascalCaseName,
            createUserPayload
        )

        await manager.persistAndFlush(user)

        if (this.config.rolesAndPermissions) {
            await manager.populate([user], ['roles.permissions'])
        }

        ctx.user = user

        if (this.config.verifyEmails && !this.config.skipWelcomeEmail) {
            mailer
                .to(user.email)
                .sendRaw(
                    `Please verify your email using this link: ${user.email_verification_token}`
                )
        }

        this.setRefreshToken(ctx)

        return this.getUserPayload(ctx)
    }

    private resendVerificationEmail = async ({
        manager,
        user,
        mailer
    }: ApiContext) => {
        if (!user.email_verification_token) {
            return false
        }

        manager.assign(user, {
            email_verification_token: this.generateRandomToken()
        })

        await manager.persistAndFlush(user)

        mailer.to(user.email).sendRaw(`
            Please verify your email using this link: ${user.email_verification_token}
        `)

        return true
    }

    private confirmEmail = async ({ manager, body, user }: ApiContext) => {
        if (
            user.email_verification_token ===
            (body.object
                ? body.object.email_verification_token
                : body.email_verification_token)
        ) {
            manager.assign(user, {
                email_verification_token: null,
                email_verified_at: Dayjs().format('YYYY-MM-DD HH:mm:ss')
            })

            await manager.persistAndFlush(user)

            return user.toJSON()
        }

        throw {
            status: 400,
            message: 'Invalid email verification token.'
        }
    }

    private socialAuth = async (
        ctx: ApiContext,
        action: 'login' | 'register'
    ) => {
        const { body, manager } = ctx
        const access_token = body.object
            ? body.object.access_token
            : body.access_token

        if (!access_token) {
            throw [
                {
                    field: 'access_token',
                    message: 'Invalid access token provided.'
                }
            ]
        }

        let oauthIdentity: any = await manager.findOne(
            this.resources.oauthIdentity.data.pascalCaseName,
            {
                temporal_token: access_token
            }
        )

        if (!oauthIdentity) {
            throw [
                {
                    field: 'access_token',
                    message: 'Invalid access token provided.'
                }
            ]
        }

        const oauthPayload = JSON.parse(oauthIdentity.payload)

        let user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email: oauthPayload.email
            }
        )

        if (!user && action === 'login') {
            throw [
                {
                    field: 'email',
                    message: 'Cannot find a user with these credentials.'
                }
            ]
        }

        if (user && action === 'register') {
            throw [
                {
                    field: 'email',
                    message: `A ${this.resources.user.data.snakeCaseName.toLowerCase()} already exists with email ${
                        oauthIdentity.email
                    }.`
                }
            ]
        }

        if (!user && action === 'register') {
            let createPayload: DataPayload = {
                ...oauthPayload
            }

            if (this.config.verifyEmails) {
                createPayload.email_verified_at = Dayjs().format(
                    'YYYY-MM-DD HH:mm:ss'
                )
                createPayload.email_verification_token = null
            }

            user = manager.create(
                this.resources.user.data.pascalCaseName,
                createPayload
            )

            await manager.persistAndFlush(user)
        }

        const belongsToField = this.resources.oauthIdentity.data.fields.find(
            field => field.name === this.resources.user.data.pascalCaseName
        )!

        manager.assign(oauthIdentity, {
            temporal_token: null,
            [belongsToField.databaseField]: user.id
        })

        await manager.flush()

        this.setRefreshToken(ctx)

        return this.getUserPayload(ctx)
    }

    private login = async (ctx: ApiContext) => {
        const { manager, body } = ctx
        const { email, password, token } = await this.validate(
            body.object ? body.object : body
        )

        const user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email
            },
            {
                populate: this.config.rolesAndPermissions
                    ? ['roles.permissions']
                    : []
            }
        )

        if (!user) {
            throw {
                message: 'Invalid credentials.',
                status: 401
            }
        }

        if (!Bcrypt.compareSync(password, user.password)) {
            throw {
                message: 'Invalid credentials.',
                status: 401
            }
        }

        if (this.config.twoFactorAuth && user.two_factor_enabled) {
            const Speakeasy = require('speakeasy')

            if (!token) {
                throw {
                    message: 'The two factor authentication token is required.',
                    status: 400
                }
            }

            const verified = Speakeasy.totp.verify({
                token,
                encoding: 'base32',
                secret: user.two_factor_secret
            })

            if (!verified) {
                throw {
                    status: 400,
                    message: `Invalid two factor authentication token.`
                }
            }
        }

        ctx.user = user

        this.setRefreshToken(ctx)

        return this.getUserPayload(ctx)
    }

    public authorizeResolver = async (
        ctx: GraphQLPluginContext,
        query: GraphQlQueryContract
    ) => {
        const authorized = await Promise.all(
            query.config.authorize.map(fn => fn(ctx))
        )

        if (
            authorized.filter(result => result).length !==
            query.config.authorize.length
        ) {
            throw new Error('Unauthorized.')
        }
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
                populate: [this.resources.permission.data.snakeCaseNamePlural],
                refresh: true
            }
        )

        if (!user) {
            ctx.user = {
                public: true,
                [this.resources.role.data.snakeCaseNamePlural]: [
                    publicRole as UserRole
                ],
                [this.resources.permission.data
                    .snakeCaseNamePlural]: publicRole[
                    this.resources.permission.data.snakeCaseNamePlural
                ]
                    .toJSON()
                    .map((permission: any) => permission.slug)
            } as any
        }
    }

    public getAuthUserFromContext = async (ctx: GraphQLPluginContext) => {
        const { req, manager } = ctx

        const { headers } = req
        const [, token] = (headers['authorization'] || '').split('Bearer ')

        if (!token) return

        try {
            const { id, refresh } = Jwt.verify(
                token,
                this.config.jwt.secretKey
            ) as JwtPayload

            if (!id || refresh) {
                return
            }

            const user: any = await manager.findOne(
                this.resources.user.data.pascalCaseName,
                {
                    id
                },
                {
                    populate: this.config.rolesAndPermissions
                        ? ['roles.permissions']
                        : []
                }
            )

            ctx.user = user
        } catch (error) {}
    }

    private disableTwoFactorAuth = async ({
        manager,
        body,
        user
    }: ApiContext) => {
        if (user.two_factor_enabled) {
            throw {
                status: 400,
                message: `You do not have two factor authentication enabled.`
            }
        }

        const Speakeasy = require('speakeasy')

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: body.object ? body.object.token : body.token,
            secret: user.two_factor_secret
        })

        if (!verified) {
            throw {
                status: 400,
                message: `Invalid two factor authentication code.`
            }
        }

        manager.assign(user, {
            two_factor_secret: null,
            two_factor_enabled: false
        })

        await manager.persistAndFlush(user)

        return user.toJSON()
    }

    private confirmEnableTwoFactorAuth = async ({
        user,
        body,
        manager
    }: ApiContext) => {
        const Speakeasy = require('speakeasy')

        const payload = await validateAll(body.object ? body.object : body, {
            token: 'required|number'
        })

        if (!user.two_factor_secret) {
            throw {
                status: 400,
                message: `You must enable two factor authentication first.`
            }
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: payload.token,
            secret: user.two_factor_secret
        })

        if (!verified) {
            throw {
                status: 400,
                message: `Invalid two factor token.`
            }
        }

        manager.assign(user, {
            two_factor_enabled: true
        })

        await manager.persistAndFlush(user)

        return user.toJSON()
    }

    private enableTwoFactorAuth = async ({ user, manager }: ApiContext) => {
        const Qr = require('qrcode')
        const Speakeasy = require('speakeasy')

        const { base32, otpauth_url } = Speakeasy.generateSecret()

        manager.assign(user, {
            two_factor_secret: base32,
            two_factor_enabled: null
        })

        await manager.persistAndFlush(user!)

        return new Promise((resolve, reject) =>
            Qr.toDataURL(
                otpauth_url,
                (error: null | Error, dataURL: string) => {
                    if (error) {
                        reject({
                            status: 500,
                            message: `Error generating qr code.`,
                            error
                        })
                    }

                    return resolve({
                        dataURL,
                        user: user.toJSON()
                    })
                }
            )
        )
    }

    protected forgotPassword = async ({
        body,
        mailer,
        manager
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
            throw {
                status: 422,
                message: 'Validation failed.',
                errors: [
                    {
                        field: 'email',
                        message: 'Invalid email address.'
                    }
                ]
            }
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

        mailer
            .to(email, existingUser.name)
            .sendRaw(`Some raw message to send with the token ${token}`)

        return true
    }

    protected resetPassword = async ({ body, manager }: ApiContext) => {
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
            throw {
                status: 422,
                errors: [
                    {
                        field: 'token',
                        message: 'Invalid reset token.'
                    }
                ]
            }
        }

        if (Dayjs(existingPasswordReset.expires_at).isBefore(Dayjs())) {
            throw {
                status: 422,
                errors: [
                    {
                        field: 'token',
                        message: 'Invalid reset token.'
                    }
                ]
            }
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

        return await validateAll(data, rules, {
            'email.required': 'The email is required.',
            'password.required': 'The password is required.',
            'name.required': 'The name is required.'
        })
    }

    public generateJwt(payload: DataPayload, refresh: boolean = false) {
        return Jwt.sign(payload, this.config.jwt.secretKey, {
            expiresIn: refresh
                ? this.config.jwt.refreshTokenExpiresIn
                : this.config.jwt.expiresIn
        })
    }

    public beforeOauthIdentityCreated(
        beforeOAuthIdentityCreated: HookFunction
    ) {
        this.config.beforeOAuthIdentityCreated = beforeOAuthIdentityCreated

        return this
    }

    public generateRandomToken() {
        return Randomstring.generate(32) + Uniqid() + Randomstring.generate(32)
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
