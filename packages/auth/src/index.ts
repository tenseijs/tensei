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
    hasMany,
    ResourceContract,
    boolean
} from '@tensei/common'

import {
    AuthData,
    GrantConfig,
    AuthPluginConfig,
    SupportedSocialProviders,
    defaultProviderScopes,
    UserWithAuth
} from './config'
import SocialAuthCallbackController from './controllers/SocialAuthCallbackController'

import { setup } from './setup'

type ResourceShortNames =
    | 'user'
    | 'team'
    | 'role'
    | 'oauthIdentity'
    | 'permission'
    | 'teamInvite'
    | 'passwordReset'

class Auth {
    private config: AuthPluginConfig = {
        profilePictures: false,
        nameResource: 'User',
        roleResource: 'Role',
        permissionResource: 'Permission',
        passwordResetResource: 'Password Reset',
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
        providers: {},
        resources: {}
    }

    private resources: {
        [key: string]: ResourceContract
    } = {}

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

        this.config.resources = this.resources
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
            socialFields = [hasMany(this.resources.oauthIdentity.data.name)]
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
            .beforeCreate(async ({ entity, em, changeSet }) => {
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
            .beforeUpdate(({ entity, em, changeSet }) => {
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
            belongsTo(this.resources.team.data.name),
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
                belongsTo(this.config.nameResource).nullable(),
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
        return plugin('Auth')
            .beforeDatabaseSetup(
                ({ pushResource, pushMiddleware, databaseConfig }) => {
                    this.refreshResources()

                    if (Object.keys(this.config.providers).length > 0) {
                        databaseConfig.entities = [
                            ...(databaseConfig.entities || []),
                            require('express-session-mikro-orm').generateSessionEntity()
                        ]
                    }

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
                }
            )

            .afterDatabaseSetup(async config => {
                const { resources } = config

                if (this.config.rolesAndPermissions) {
                    await setup(config, this.config)
                }

                if (this.config.rolesAndPermissions) {
                    resources.forEach(resource => {
                        resource.canCreate(
                            ({ user }) =>
                                user?.permissions?.includes(
                                    `create:${resource.data.slug}`
                                ) || false
                        )
                        resource.canFetch(
                            ({ user }) =>
                                user?.permissions?.includes(
                                    `fetch:${resource.data.slug}`
                                ) || false
                        )
                        resource.canShow(
                            ({ user }) =>
                                user?.permissions?.includes(
                                    `show:${resource.data.slug}`
                                ) || false
                        )
                        resource.canUpdate(
                            ({ user }) =>
                                user?.permissions?.includes(
                                    `update:${resource.data.slug}`
                                ) || false
                        )
                        resource.canDelete(
                            ({ user }) =>
                                user?.permissions?.includes(
                                    `delete:${resource.data.slug}`
                                ) || false
                        )

                        resource.data.actions.forEach(action => {
                            resource.canRunAction(
                                ({ user }) =>
                                    user?.permissions?.includes(
                                        `run:${resource.data.slug}:${action.data.slug}`
                                    ) || false
                            )
                        })
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
    }

    private getApiPath(path: string) {
        return `/${this.config.apiPath}/${path}`
    }

    private register = async (
        { manager, mailer, body }: Request,
        response: Response
    ) => {
        let createUserPayload = body

        const authenticatorRole: any = await manager.findOneOrFail(
            this.resources.role.data.pascalCaseName,
            {
                slug: 'authenticated'
            }
        )

        const UserResource = this.resources.user

        const user: any = manager.create(UserResource.data.pascalCaseName, {
            ...createUserPayload,
            roles: [authenticatorRole.id]
        })

        await manager.persistAndFlush(user)

        if (this.config.rolesAndPermissions) {
            await manager.populate([user], ['roles.permissions'])
        }

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
            manager.assign(user!, {
                email_verification_token: null,
                email_verified_at: Dayjs().format('YYYY-MM-DD HH:mm:ss')
            })

            await manager.persistAndFlush(user!)

            return response.status(200).json({
                message: `Email has been verified.`,
                user
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

        let oauthIdentity: any = await manager.findOne(
            this.resources.oauthIdentity.data.pascalCaseName,
            {
                temporal_token: body.access_token
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

        oauthIdentity = {
            ...oauthIdentity,
            payload: JSON.parse(oauthIdentity.payload)
        }

        let user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email: oauthIdentity.payload.email
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
                    message: `A ${this.resources.user.data.name.toLowerCase()} already exists with email ${
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

            user = manager.create(
                this.resources.user.data.pascalCaseName,
                createPayload
            )
        }

        const belongsToField = this.resources.oauthIdentity.data.fields.find(
            field => field.name === this.config.nameResource
        )!

        manager.assign(oauthIdentity, {
            temporal_token: null,
            [belongsToField?.databaseField]: user.id
        })

        await manager.persistAndFlush(oauthIdentity)

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

        const user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email
            },
            {
                populate: ['roles.permissions']
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

        if (user.two_factor_enabled) {
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
                secret: user.two_factor_secret
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
            user: user.toJSON()
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

            request.user = user
        } catch (errors) {
            return next()
        }

        return next()
    }

    private disableTwoFactorAuth = async (
        { manager, body, user }: Request,
        response: Response
    ) => {
        if (!user?.two_factor_enabled) {
            return response.status(400).json({
                message: `You do not have two factor authentication enabled.`
            })
        }

        const Speakeasy = require('speakeasy')

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: body.token,
            secret: user?.two_factor_secret
        })

        if (!verified) {
            return response.status(400).json({
                message: `Invalid two factor authentication code.`
            })
        }

        manager.assign(user, {
            two_factor_secret: null,
            two_factor_enabled: false
        })

        await manager.persistAndFlush(user)

        return response.json({
            message: `Two factor auth has been disabled.`,
            user: user.toJSON()
        })
    }

    private confirmEnableTwoFactorAuth = async (
        { user, body, manager }: Request,
        response: Response
    ) => {
        const Speakeasy = require('speakeasy')

        await validateAll(body, {
            token: 'required|number'
        })

        if (!user?.two_factor_secret) {
            return response.status(400).json({
                message: `You must enable two factor authentication first.`
            })
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: body.token,
            secret: user?.two_factor_secret
        })

        if (!verified) {
            return response.status(400).json({
                message: `Invalid two factor token.`
            })
        }

        manager.assign(user!, {
            two_factor_enabled: true
        })

        await manager.persistAndFlush(user!)

        return response.json({
            message: `Two factor authentication has been enabled.`,
            user: user?.toJSON()
        })
    }

    private enableTwoFactorAuth = async (
        { user, manager }: Request,
        response: Response
    ) => {
        const Qr = require('qrcode')
        const Speakeasy = require('speakeasy')

        const { base32, otpauth_url } = Speakeasy.generateSecret()

        manager.assign(user!, {
            two_factor_secret: base32,
            two_factor_enabled: null
        })

        await manager.persistAndFlush(user!)

        Qr.toDataURL(otpauth_url, (error: null | Error, dataURL: string) => {
            if (error) {
                return response.status(500).json({
                    message: `Error generating qr code.`,
                    error
                })
            }

            return response.json({
                dataURL,
                user: user?.toJSON()
            })
        })
    }

    protected forgotPassword = async (request: Request, response: Response) => {
        const { body, mailer, manager } = request
        const { email } = await validateAll(body, {
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

        let existingPasswordReset: any = await manager.findOne(
            this.resources.passwordReset.data.pascalCaseName,
            {
                token
            }
        )

        if (!existingPasswordReset) {
            return response.status(422).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.'
                }
            ])
        }

        if (Dayjs(existingPasswordReset.expires_at).isBefore(Dayjs())) {
            return response.status(422).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.'
                }
            ])
        }

        let user: any = await manager.findOne(
            this.resources.user.data.pascalCaseName,
            {
                email: existingPasswordReset.email
            }
        )

        if (!user) {
            manager.removeAndFlush(existingPasswordReset)

            return response.status(500).json({
                message: 'User does not exist anymore.'
            })
        }

        manager.assign(user, {
            password
        })

        manager.persist(user)
        manager.remove(existingPasswordReset)

        await manager.flush()

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
