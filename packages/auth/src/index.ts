import Dayjs from 'dayjs'
import Uniqid from 'uniqid'
import Bcrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import Randomstring from 'randomstring'
import AsyncHandler from 'express-async-handler'
import { validateAll } from 'indicative/validator'
import { Request, Response, NextFunction } from 'express'
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
    SupportedDatabases,
    Config,
    FieldContract,
    hasMany
} from '@tensei/common'

import {
    AuthData,
    GrantConfig,
    AuthPluginConfig,
    SupportedSocialProviders,
    defaultProviderScopes
} from './config'
import SocialAuthCallbackController from './controllers/SocialAuthCallbackController'

import SetupSql from './setup-sql'

class Auth {
    private config: AuthPluginConfig = {
        profilePictures: false,
        nameResource: 'User',
        roleResource: 'Role',
        permissionResource: 'Permission',
        passwordResetsResource: 'Password Reset',
        fields: [],
        apiPath: 'auth',
        jwt: {
            expiresIn: '7d',
            secretKey: process.env.JWT_SECRET || 'auth-secret-key'
        },
        teams: false,
        teamFields: [],
        twoFactorAuth: false,
        verifyEmails: false,
        skipWelcomeEmail: false,
        rolesAndPermissions: false,
        providers: {}
    }

    public beforeCreateUser(hook: HookFunction) {
        this.config.beforeCreateUser = hook

        return this
    }

    public afterCreateUser(hook: HookFunction) {
        this.config.afterCreateUser = hook

        return this
    }

    public beforeUpdateUser(hook: HookFunction) {
        this.config.beforeUpdateUser = hook

        return this
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

    public name(name: string) {
        this.config.nameResource = name

        return this
    }

    public verifyEmails() {
        this.config.verifyEmails = true

        return this
    }

    public tokenExpiresIn(tokenExpiresIn: string) {
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
            socialFields = [hasMany(this.oauthResource().data.name)]
        }

        const userResource = resource(this.config.nameResource)
            .fields([
                text('Name').searchable().creationRules('required'),
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
                          text('Two Factor Enabled')
                              .hideOnCreate()
                              .hideOnUpdate()
                              .hideOnIndex()
                              .hideOnDetail(),
                          text('Two Factor Secret')
                              .hidden()
                              .hideOnIndex()
                              .hideOnCreate()
                              .hideOnUpdate()
                              .hideOnDetail()
                      ]
                    : []),
                ...this.config.fields,
                ...(this.config.verifyEmails
                    ? [
                          dateTime('Email Verified At')
                              .hideOnIndex()
                              .hideOnDetail(),
                          text('Email Verification Token')
                              .hidden()
                              .hideOnCreate()
                              .hideOnIndex()
                              .hideOnUpdate()
                              .hideOnDetail()
                      ]
                    : [])
            ])
            .beforeCreate((payload, request) => {
                const parsedPayload: DataPayload = {
                    ...payload,
                    password: payload.password
                        ? Bcrypt.hashSync(payload.password)
                        : null
                }

                if (this.config.verifyEmails) {
                    parsedPayload.email_verification_token = this.generateRandomToken()
                }

                if (this.config.beforeCreateUser) {
                    return this.config.beforeCreateUser(parsedPayload, request)
                }

                return parsedPayload
            })
            .beforeUpdate((payload, request) => {
                let parsedPayload = payload

                if (payload.password) {
                    parsedPayload = {
                        ...payload,
                        password: Bcrypt.hashSync(payload.password)
                    }
                }

                if (this.config.beforeUpdateUser) {
                    return this.config.beforeUpdateUser(parsedPayload, request)
                }

                return parsedPayload
            })
            .group('Users & Permissions')

        return userResource
    }

    private teamResource() {
        return resource('Team')
            .fields([
                text('Name').unique(),
                belongsTo(this.config.nameResource),
                belongsToMany(this.config.nameResource),
                ...this.config.teamFields
            ])
            .hideFromNavigation()
    }

    private teamInviteResource() {
        return resource('Team Invite').fields([
            text('Email'),
            text('Role'),
            text('Token').unique().rules('required'),
            belongsTo(this.teamResource().data.name),
            belongsTo(this.config.nameResource)
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

                belongsToMany(this.config.nameResource),
                belongsToMany(this.config.permissionResource)
            ])
            .displayField('name')
            .group('Users & Permissions')
    }

    private passwordResetsResource() {
        return resource(this.config.passwordResetsResource)
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
                belongsTo(this.config.nameResource),
                textarea('Access Token')
                    .hidden()
                    .hideOnUpdate()
                    .hideOnIndex()
                    .hideOnDetail()
                    .hideOnCreate(),
                text('Email'),
                textarea('Temporal Token'),
                json('Payload'),
                text('Provider').rules('required'),
                text('Provider User ID')
            ])
    }

    public plugin() {
        return (
            plugin('Auth')
                .beforeDatabaseSetup(({ pushResource, pushMiddleware }) => {
                    pushResource(this.userResource())
                    pushResource(this.passwordResetsResource())

                    if (this.config.rolesAndPermissions) {
                        pushResource(this.roleResource())

                        pushResource(this.permissionResource())
                    }

                    if (this.config.teams) {
                        pushResource(this.teamResource())

                        pushResource(this.teamInviteResource())
                    }

                    if (Object.keys(this.config.providers).length > 0) {
                        pushResource(this.oauthResource())
                    }

                    ;([
                        'show',
                        'index',
                        'delete',
                        'create',
                        'runAction',
                        'showRelation',
                        'update'
                    ] as InBuiltEndpoints[]).forEach(endpoint => {
                        pushMiddleware({
                            type: endpoint,
                            handler: this.setAuthMiddleware
                        })

                        pushMiddleware({
                            type: endpoint,
                            handler: this.authMiddleware
                        })
                    })

                    return Promise.resolve()
                })

                // TODO: If we support more databases, add a setup method for each database.
                .afterDatabaseSetup(async config => {
                    const { resources, database } = config

                    if (this.config.rolesAndPermissions) {
                        if (['mysql', 'pg', 'sqlite'].includes(database)) {
                            SetupSql(config, this.config)
                        }

                        if (['mongodb'].includes(database)) {
                            // TODO: Setup mongodb
                        }
                    }

                    if (this.config.rolesAndPermissions) {
                        resources.forEach(resource => {
                            resource.canCreate(
                                ({ user }) =>
                                    user?.permissions.includes(
                                        `create:${resource.data.slug}`
                                    ) || false
                            )
                            resource.canFetch(
                                ({ user }) =>
                                    user?.permissions.includes(
                                        `fetch:${resource.data.slug}`
                                    ) || false
                            )
                            resource.canShow(
                                ({ user }) =>
                                    user?.permissions.includes(
                                        `show:${resource.data.slug}`
                                    ) || false
                            )
                            resource.canUpdate(
                                ({ user }) =>
                                    user?.permissions.includes(
                                        `update:${resource.data.slug}`
                                    ) || false
                            )
                            resource.canDelete(
                                ({ user }) =>
                                    user?.permissions.includes(
                                        `delete:${resource.data.slug}`
                                    ) || false
                            )

                            resource.data.actions.forEach(action => {
                                resource.canRunAction(
                                    ({ user }) =>
                                        user?.permissions.includes(
                                            `run:${resource.data.slug}:${action.data.slug}`
                                        ) || false
                                )
                            })

                            if (
                                resource.data.name ===
                                this.userResource().data.name
                            ) {
                                resource.canUpdate(({ user }) => {
                                    if (
                                        ['authenticated', 'public'].includes('')
                                    ) {
                                    }
                                    return false
                                })
                            }
                        })
                    }
                })

                .beforeCoreRoutesSetup(async config => {
                    const { app, serverUrl, clientUrl } = config

                    app.post(this.getApiPath('login'), AsyncHandler(this.login))
                    app.post(
                        this.getApiPath('register'),
                        AsyncHandler(this.register)
                    )
                    app.post(
                        this.getApiPath('reset-password'),
                        AsyncHandler(this.resetPassword)
                    )
                    app.post(
                        this.getApiPath('forgot-password'),
                        AsyncHandler(this.forgotPassword)
                    )

                    if (this.config.twoFactorAuth) {
                        app.post(
                            this.getApiPath('two-factor/enable'),
                            this.setAuthMiddleware,
                            this.authMiddleware,
                            AsyncHandler(this.enableTwoFactorAuth)
                        )

                        app.post(
                            this.getApiPath('two-factor/disable'),
                            this.setAuthMiddleware,
                            this.authMiddleware,
                            AsyncHandler(this.disableTwoFactorAuth)
                        )

                        app.post(
                            this.getApiPath('two-factor/confirm'),
                            this.setAuthMiddleware,
                            this.authMiddleware,
                            AsyncHandler(this.confirmEnableTwoFactorAuth)
                        )
                    }

                    if (this.config.verifyEmails) {
                        app.post(
                            this.getApiPath('emails/confirm'),
                            this.setAuthMiddleware,
                            this.authMiddleware,
                            AsyncHandler(this.confirmEmail)
                        )
                    }

                    if (Object.keys(this.config.providers).length > 0) {
                        const grant = require('grant')
                        const ExpressSession = require('express-session')

                        app.use(
                            ExpressSession(
                                this.getSessionPackageConfig(
                                    config,
                                    require(this.getSessionPackage(
                                        config.database
                                    ))(ExpressSession)
                                )
                            )
                        )

                        Object.keys(this.config.providers).forEach(provider => {
                            const providerConfig = this.config.providers[
                                provider
                            ]
                            const clientCallback =
                                providerConfig.clientCallback || ''

                            this.config.providers[provider] = {
                                ...providerConfig,
                                redirect_uri: `${serverUrl}/connect/${provider}/callback`,
                                clientCallback: clientCallback.startsWith(
                                    'http'
                                )
                                    ? clientCallback
                                    : `${clientUrl}${
                                          clientCallback.startsWith('/')
                                              ? '/'
                                              : ''
                                      }${clientCallback}`
                            }
                        })

                        app.use(grant.express()(this.config.providers))

                        app.get(
                            `/${this.config.apiPath}/:provider/callback`,
                            SocialAuthCallbackController.connect(
                                config,
                                this.config
                            )
                        )

                        app.post(
                            `/${this.config.apiPath}/social/:action`,
                            AsyncHandler(this.socialAuth)
                        )
                    }

                    return {}
                })
        )
    }

    private getSessionPackage(database: SupportedDatabases) {
        if (['mongodb'].includes(database)) {
            return 'connect-mongo'
        }

        return 'connect-session-knex'
    }

    private getSessionPackageConfig(config: Config, Store: any) {
        let storeArguments: any = {}

        if (['mysql', 'pg', 'sqlite3'].includes(config.database)) {
            storeArguments = {
                knex: config.databaseClient
            }
        }

        if (['mongodb'].includes(config.database)) {
            storeArguments = {
                mongooseConnection: require('mongoose').connection
            }
        }

        return {
            secret: process.env.GRANT_SESSION_SECRET || 'grant',
            store: new Store(storeArguments),
            resave: false,
            saveUninitialized: false
        }
    }

    private getApiPath(path: string) {
        return `/${this.config.apiPath}/${path}`
    }

    private register = async (
        { manager, mailer, body }: Request,
        response: Response
    ) => {
        let createUserPayload = body

        const { id } = await manager(this.userResource()).create(
            createUserPayload
        )

        const model = await manager(this.userResource())
            .database()
            .findOneById(
                id,
                [],
                this.config.rolesAndPermissions
                    ? [
                          `${this.roleResource().data.slug}.${
                              this.permissionResource().data.slug
                          }`
                      ]
                    : []
            )

        const user = model.toJSON ? model.toJSON() : model

        if (this.config.verifyEmails && !this.config.skipWelcomeEmail) {
            mailer.to(user.email).sendRaw(`
                    Please verify your email using this link: ${user.email_verification_token}
                `)
        }

        return response.status(201).json({
            token: this.generateJwt({
                id: user.id
            }),
            user
        })
    }

    private confirmEmail = async (
        { manager, body, user }: Request,
        response: Response
    ) => {
        if (user?.email_verification_token === body.email_verification_token) {
            await manager(this.userResource())
                .database()
                .updateOneByField('id', user?.id, {
                    email_verification_token: null,
                    email_verified_at: Dayjs().format('YYYY-MM-DD HH:mm:ss')
                })

            return response.status(200).json({
                message: `Email has been verified.`
            })
        }

        return response.status(400).json({
            message: 'Invalid email verification token.'
        })
    }

    private socialAuth = async (request: Request, response: Response) => {
        const { params, body, manager } = request

        const { action } = params

        if (!['login', 'register'].includes(action)) {
            throw {
                status: 400,
                message: 'Action can only be login or register.'
            }
        }

        if (!body.access_token) {
            throw [
                {
                    field: 'access_token',
                    message: 'Invalid access token provided.'
                }
            ]
        }

        let oauthIdentity = await manager('Oauth Identity')
            .database()
            .findOneByField('temporal_token', body.access_token)

        if (!oauthIdentity) {
            throw [
                {
                    field: 'access_token',
                    message: 'Invalid access token provided.'
                }
            ]
        }

        oauthIdentity = {
            ...oauthIdentity,
            payload: JSON.parse(oauthIdentity.payload)
        }

        let user = await manager(this.config.nameResource)
            .database()
            .findOneByField('email', oauthIdentity.payload.email)

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
                    message: `A ${this.userResource().data.name.toLowerCase()} already exists with email ${
                        oauthIdentity.email
                    }.`
                }
            ]
        }

        if (!user && action === 'register') {
            let createPayload: DataPayload = {
                ...oauthIdentity.payload
            }

            if (this.config.verifyEmails) {
                createPayload.email_verified_at = Dayjs().format(
                    'YYYY-MM-DD HH:mm:ss'
                )
                createPayload.email_verification_token = null
            }

            createPayload = (await this.config.beforeCreateUser)
                ? this.config.beforeCreateUser!(createPayload, request)
                : createPayload

            user = await manager(this.config.nameResource)
                .database()
                .create(createPayload)
        }

        const belongsToField = this.oauthResource().data.fields.find(
            field => field.name === this.config.nameResource
        )!

        await manager('Oauth Identity')
            .database()
            .update(
                oauthIdentity.id,
                {
                    temporal_token: null,
                    [belongsToField?.databaseField]: user.id
                },
                {},
                true
            )

        return response.json({
            token: this.generateJwt({
                id: user.id
            }),
            user
        })
    }

    private login = async (request: Request, response: Response) => {
        const { manager } = request
        const { email, password, token } = await this.validate(request.body)

        const userWithPassword = await manager(
            this.userResource()
        ).findOneByField('email', email)

        if (!userWithPassword) {
            throw {
                message: 'Invalid credentials.',
                status: 401
            }
        }

        if (!Bcrypt.compareSync(password, userWithPassword.password)) {
            throw {
                message: 'Invalid credentials.',
                status: 401
            }
        }

        const model = await request
            .manager(this.userResource())
            .database()
            .findOneById(
                userWithPassword.id,
                [],
                this.config.rolesAndPermissions
                    ? [
                          `${this.roleResource().data.slug}.${
                              this.permissionResource().data.slug
                          }`
                      ]
                    : []
            )

        const user = model.toJSON ? model.toJSON() : model

        if (user.two_factor_enabled === '1') {
            const Speakeasy = require('speakeasy')

            if (!token) {
                return response.status(400).json({
                    message: 'The two factor authentication token is required.',
                    requiresTwoFactorToken: true
                })
            }

            const verified = Speakeasy.totp.verify({
                token,
                encoding: 'base32',
                secret: model.two_factor_secret
            })

            if (!verified) {
                return response.status(400).json({
                    message: `Invalid two factor authentication token.`
                })
            }
        }

        return response.json({
            token: this.generateJwt({
                id: user.id
            }),
            user
        })
    }

    public authMiddleware = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        if (!request.user) {
            return response.status(401).json({
                message: 'Unauthenticated.'
            })
        }

        next()
    }

    public verifiedMiddleware = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        if (!request.user?.email_verified_at) {
            return response.status(400).json({
                message: 'Unverified.'
            })
        }

        next()
    }

    public setAuthMiddleware = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { headers, manager } = request
        const [, token] = (headers['authorization'] || '').split('Bearer ')

        if (!token) {
            return next()
        }

        try {
            const { id } = Jwt.verify(token, this.config.jwt.secretKey) as {
                id: number
            }

            const model = await manager(this.userResource())
                .database()
                .findOneById(
                    id,
                    [],
                    this.config.rolesAndPermissions
                        ? [
                              `${this.roleResource().data.slug}.${
                                  this.permissionResource().data.slug
                              }`
                          ]
                        : []
                )

            const user = {
                ...model.toJSON(),
                two_factor_secret: model.get
                    ? model.get('two_factor_secret')
                    : model.two_factor_secret,
                two_factor_enabled: model.get
                    ? model.get('two_factor_enabled') === '1'
                    : model.two_factor_enabled,
                email_verification_token: model.get
                    ? model.get('email_verification_token')
                    : model.email_verification_token
            }

            if (this.config.rolesAndPermissions) {
                user.permissions = user[this.roleResource().data.slug].reduce(
                    (acc: [], role: any) => [
                        ...acc,
                        ...(
                            role[this.permissionResource().data.slug] || []
                        ).map((permission: any) => permission.slug)
                    ],
                    []
                )
            }

            request.user = user
        } catch (errors) {
            return next()
        }

        return next()
    }

    private disableTwoFactorAuth = async (
        request: Request,
        response: Response
    ) => {
        if (!request.user?.two_factor_enabled) {
            return response.status(400).json({
                message: `You do not have two factor authentication enabled.`
            })
        }

        const Speakeasy = require('speakeasy')

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: request.body.token,
            secret: request.user?.two_factor_secret
        })

        if (!verified) {
            return response.status(400).json({
                message: `Invalid two factor authentication code.`
            })
        }

        await request.manager(this.userResource()).update(
            request.user!.id,
            {
                two_factor_secret: null,
                two_factor_enabled: false
            },
            true
        )

        return response.json({
            message: `Two factor auth has been disabled.`
        })
    }

    private confirmEnableTwoFactorAuth = async (
        request: Request,
        response: Response
    ) => {
        const Speakeasy = require('speakeasy')

        await validateAll(request.body, {
            token: 'required|number'
        })

        if (!request.user?.two_factor_secret) {
            return response.status(400).json({
                message: `You must enable two factor authentication first.`
            })
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: request.body.token,
            secret: request.user?.two_factor_secret
        })

        if (!verified) {
            return response.status(400).json({
                message: `Invalid two factor token.`
            })
        }

        await request.manager(this.userResource()).update(
            request.user!.id,
            {
                two_factor_enabled: true
            },
            true
        )

        return response.json({
            message: `Two factor authentication has been enabled.`
        })
    }

    private enableTwoFactorAuth = async (
        request: Request,
        response: Response
    ) => {
        const Qr = require('qrcode')
        const Speakeasy = require('speakeasy')

        const { base32, otpauth_url } = Speakeasy.generateSecret()

        await request.manager(this.userResource()).update(
            request.user!.id,
            {
                two_factor_secret: base32,
                two_factor_enabled: false
            },
            true
        )

        Qr.toDataURL(otpauth_url, (error: null | Error, dataURL: string) => {
            if (error) {
                return response.status(500).json({
                    message: `Error generating qr code.`,
                    error
                })
            }

            return response.json({
                dataURL
            })
        })
    }

    protected forgotPassword = async (request: Request, response: Response) => {
        const { body, mailer, manager } = request
        const { email } = await validateAll(body, {
            email: 'required|email'
        })

        const existingUser = await manager(this.userResource()).findOneByField(
            'email',
            email
        )
        const existingPasswordReset = await manager(
            this.passwordResetsResource()
        ).findOneByField('email', email)

        if (!existingUser) {
            return response.status(422).json([
                {
                    field: 'email',
                    message: 'Invalid email address.'
                }
            ])
        }

        const token = this.generateRandomToken()

        const expiresAt = Dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')

        if (existingPasswordReset) {
            // make sure it has not expired
            await manager(this.passwordResetsResource()).updateOneByField(
                'email',
                email,
                {
                    token,
                    expires_at: expiresAt
                }
            )
        } else {
            await manager(this.passwordResetsResource()).database().create({
                email,
                token
            })
        }

        mailer
            .to(email, existingUser.name)
            .sendRaw(`Some raw message to send with the token ${token}`)

        return response.json({
            message: `Please check your email for steps to reset your password.`
        })
    }

    protected resetPassword = async (request: Request, response: Response) => {
        const { body, manager } = request

        const { token, password } = await validateAll(body, {
            token: 'required|string',
            password: 'required|string|min:8'
        })

        let existingPasswordReset = await manager(
            this.passwordResetsResource()
        ).findOneByField('token', token)

        if (!existingPasswordReset) {
            return response.status(422).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.'
                }
            ])
        }

        existingPasswordReset = existingPasswordReset.toJSON
            ? existingPasswordReset.toJSON()
            : existingPasswordReset

        if (Dayjs(existingPasswordReset.expires_at).isBefore(Dayjs())) {
            return response.status(422).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.'
                }
            ])
        }

        let user = await manager(this.userResource()).findOneByField(
            'email',
            existingPasswordReset.email
        )

        if (!user) {
            await manager(this.passwordResetsResource())
                .database()
                .deleteById(existingPasswordReset.id)

            return response.status(500).json({
                message: 'User does not exist anymore.'
            })
        }

        // TODO: Rename update to updateOneByField
        await manager(this.userResource()).update(
            user.id,
            {
                password
            },
            true
        )

        // TODO: Rename deleteById this to deleteOneById
        await manager(this.passwordResetsResource())
            .database()
            .deleteById(existingPasswordReset.id)

        // TODO: Send an email to the user notifying them
        // that their password was reset.

        response.json({
            message: `Password reset successful.`
        })
    }

    protected validate = async (data: AuthData, registration = false) => {
        let rules: {
            [key: string]: string
        } = {
            email: 'required|email',
            password: 'required|min:8'
        }

        if (registration) {
            rules.name = 'required'
        }

        return await validateAll(data, rules, {
            'email.required': 'The email is required.',
            'password.required': 'The password is required.',
            'name.required': 'The name is required.'
        })
    }

    public generateJwt(payload: DataPayload) {
        return Jwt.sign(payload, this.config.jwt.secretKey, {
            expiresIn: this.config.jwt.expiresIn
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
