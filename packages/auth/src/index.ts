import Dayjs from 'dayjs'
import Uniqid from 'uniqid'
import Bcrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import Randomstring from 'randomstring'
import AsyncHandler from 'express-async-handler'
import { validateAll } from 'indicative/validator'
import { Request, Response, NextFunction } from 'express'
import {
    tool,
    resource,
    text,
    belongsTo,
    belongsToMany,
    dateTime,
} from '@flamingo/common'

import { AuthToolConfig, AuthData } from './config'

import SetupSql from './setup-sql'

class Auth {
    private config: AuthToolConfig = {
        nameResource: 'User',
        roleResource: 'Role',
        permissionResource: 'Permission',
        passwordResetsResource: 'Password Resets',
        fields: [],
        apiPath: 'api/auth',
        jwt: {
            expiresIn: '7d',
            secretKey: process.env.JWT_SECRET || 'auth-secret-key',
        },
        teams: false,
        teamFields: [],
        twoFactorAuth: false,
    }

    public name(name: string) {
        this.config.nameResource = name

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

    public fields(fields: AuthToolConfig['fields']) {
        this.config.fields = fields

        return this
    }

    public teamFields(fields: AuthToolConfig['teamFields']) {
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

    private userResource() {
        return resource(this.config.nameResource)
            .fields([
                text('Name').searchable().creationRules('required'),
                text('Email')
                    .unique()
                    .searchable()
                    .notNullable()
                    .creationRules('required|email'),
                text('Password')
                    .hidden()
                    .notNullable()
                    .htmlAttributes({
                        type: 'password',
                    })
                    .creationRules('required')
                    .onlyOnForms()
                    .hideWhenUpdating(),
                belongsToMany(this.config.roleResource),
                ...(this.config.twoFactorAuth
                    ? [
                          text('Two Factor Enabled')
                              .hideWhenCreating()
                              .hideWhenUpdating()
                              .hideFromIndex()
                              .hideFromDetail(),
                          text('Two Factor Secret')
                              .hidden()
                              .hideFromIndex()
                              .hideWhenCreating()
                              .hideWhenUpdating()
                              .hideFromDetail(),
                      ]
                    : []),
                ...this.config.fields,
            ])
            .beforeCreate((payload) => ({
                ...payload,
                password: Bcrypt.hashSync(payload.password),
            }))
            .beforeUpdate((payload) => {
                if (payload.password) {
                    return {
                        ...payload,
                        password: Bcrypt.hashSync(payload.password),
                    }
                }

                return payload
            })
            .group('Users & Permissions')
    }

    private teamResource() {
        return resource('Team')
            .fields([
                text('Name').unique(),
                belongsTo(this.config.nameResource),
                belongsToMany(this.config.nameResource),
                ...this.config.teamFields,
            ])
            .hideFromNavigation()
    }

    private teamInviteResource() {
        return resource('Team Invite').fields([
            text('Email'),
            text('Role'),
            text('Token').unique().rules('required'),
            belongsTo(this.teamResource().data.name),
            belongsTo(this.config.nameResource),
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
                belongsToMany(this.config.roleResource),
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
                    .rules('required'),

                belongsToMany(this.config.nameResource),
                belongsToMany(this.config.permissionResource),
            ])
            .displayField('name')
            .group('Users & Permissions')
    }

    private passwordResetsResource() {
        return resource(this.config.passwordResetsResource)
            .hideFromNavigation()
            .fields([
                text('Email').searchable().unique().notNullable(),
                text('Token').unique().notNullable(),
                dateTime('Expires At'),
            ])
    }

    public tool() {
        return (
            tool('Auth')
                .beforeDatabaseSetup(({ pushResource }) => {
                    pushResource(this.userResource())

                    pushResource(this.roleResource())

                    pushResource(this.permissionResource())

                    pushResource(this.passwordResetsResource())

                    if (this.config.teams) {
                        pushResource(this.teamResource())

                        pushResource(this.teamInviteResource())
                    }

                    return Promise.resolve()
                })

                // TODO: If we support more databases, add a setup method for each database.
                .afterDatabaseSetup(({ resources }) =>
                    SetupSql(resources, this.config)
                )

                .beforeCoreRoutesSetup(async ({ app }) => {
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

                    return {}
                })
        )
    }

    private getApiPath(path: string) {
        return `/${this.config.apiPath}/${path}`
    }

    private register = async (request: Request, response: Response) => {
        const { id } = await request.resourceManager.create(
            request,
            this.userResource(),
            request.body
        )

        const UserModel = request.resources[
            this.userResource().data.slug
        ].Model()

        const user = (
            await UserModel.where({
                id,
            }).fetch({
                withRelated: [
                    `${this.roleResource().data.slug}.${
                        this.permissionResource().data.slug
                    }`,
                ],
            })
        ).toJSON()

        return response.status(201).json({
            token: this.generateJwt({
                id: user.id,
            }),
            user,
        })
    }

    private login = async (request: Request, response: Response) => {
        const { email, password, token } = await this.validate(request.body)

        const UserModel = request.resources[
            this.userResource().data.slug
        ].Model()

        const [userWithPassword] = await UserModel.query().where({
            email,
        })

        if (!userWithPassword) {
            throw {
                message: 'Invalid credentials.',
                status: 401,
            }
        }

        if (!Bcrypt.compareSync(password, userWithPassword.password)) {
            throw {
                message: 'Invalid credentials.',
                status: 401,
            }
        }

        const model = await UserModel.where({
            id: userWithPassword.id,
        }).fetch({
            withRelated: [
                `${this.roleResource().data.slug}.${
                    this.permissionResource().data.slug
                }`,
            ],
        })

        const user = model.toJSON()

        if (user.two_factor_enabled) {
            const Speakeasy = require('speakeasy')

            if (!token) {
                return response.status(400).json({
                    message: 'The two factor authentication token is required.',
                    requiresTwoFactorToken: true,
                })
            }

            const verified = Speakeasy.totp.verify({
                token,
                encoding: 'base32',
                secret: model.get('two_factor_secret'),
            })

            if (!verified) {
                return response.status(400).json({
                    message: `Invalid two factor authentication token.`,
                })
            }
        }

        return response.json({
            token: this.generateJwt({
                id: user.id,
            }),
            user,
        })
    }

    private authMiddleware = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        if (!request.authUser) {
            return response.status(401).json({
                message: 'Unauthenticated.',
            })
        }

        next()
    }

    private setAuthMiddleware = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { headers, resourceManager } = request
        const [, token] = (headers['authorization'] || '').split('Bearer ')

        if (!token) {
            return next()
        }

        try {
            const { id } = Jwt.verify(token, this.config.jwt.secretKey) as {
                id: number
            }

            const model = await resourceManager.findOneById(
                request,
                this.userResource().data.slug,
                id,
                [
                    `${this.roleResource().data.slug}.${
                        this.permissionResource().data.slug
                    }`,
                ]
            )

            const user = {
                ...model.toJSON(),
                two_factor_secret: model.get('two_factor_secret'),
                two_factor_enabled: model.get('two_factor_enabled') === '1',
            }

            user.permissions = user[this.roleResource().data.slug].reduce(
                (acc: [], role: any) => [
                    ...acc,
                    ...(role[this.permissionResource().data.slug] || []).map(
                        (permission: any) => permission.slug
                    ),
                ],
                []
            )

            request.authUser = user
        } catch (errors) {
            return next()
        }

        return next()
    }

    private disableTwoFactorAuth = async (
        request: Request,
        response: Response
    ) => {
        if (!request.authUser?.two_factor_enabled) {
            return response.status(400).json({
                message: `You do not have two factor authentication enabled.`,
            })
        }

        const Speakeasy = require('speakeasy')

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: request.body.token,
            secret: request.authUser?.two_factor_secret,
        })

        if (!verified) {
            return response.status(400).json({
                message: `Invalid two factor authentication code.`,
            })
        }

        await request.resourceManager.update(
            request,
            this.userResource(),
            request.authUser!.id,
            {
                two_factor_secret: null,
                two_factor_enabled: false,
            },
            true
        )

        return response.json({
            message: `Two factor auth has been disabled.`,
        })
    }

    private confirmEnableTwoFactorAuth = async (
        request: Request,
        response: Response
    ) => {
        const Speakeasy = require('speakeasy')

        await validateAll(request.body, {
            token: 'required|number',
        })

        if (!request.authUser?.two_factor_secret) {
            return response.status(400).json({
                message: `You must enable two factor authentication first.`,
            })
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: request.body.token,
            secret: request.authUser?.two_factor_secret,
        })

        if (!verified) {
            return response.status(400).json({
                message: `Invalid two factor token.`,
            })
        }

        await request.resourceManager.update(
            request,
            this.userResource(),
            request.authUser!.id,
            {
                two_factor_enabled: true,
            },
            true
        )

        return response.json({
            message: `Two factor authentication has been enabled.`,
        })
    }

    private enableTwoFactorAuth = async (
        request: Request,
        response: Response
    ) => {
        const Qr = require('qrcode')
        const Speakeasy = require('speakeasy')

        const { base32, otpauth_url } = Speakeasy.generateSecret()

        await request.resourceManager.update(
            request,
            this.userResource(),
            request.authUser!.id,
            {
                two_factor_secret: base32,
                two_factor_enabled: false,
            },
            true
        )

        Qr.toDataURL(otpauth_url, (error: null | Error, dataURL: string) => {
            if (error) {
                return response.status(500).json({
                    message: `Error generating qr code.`,
                    error,
                })
            }

            return response.json({
                dataURL,
            })
        })
    }

    private forgotPassword = async (request: Request, response: Response) => {
        const { body, resources, Mailer } = request
        const { email } = await validateAll(body, {
            email: 'required|email',
        })

        const UserModel = resources[this.userResource().data.slug].Model()

        const PasswordResetModel = resources[
            this.passwordResetsResource().data.slug
        ].Model()

        const existingUser = await UserModel.where({
            email,
        }).fetch({
            require: false,
        })

        const existingPasswordReset = await PasswordResetModel.where({
            email,
        }).fetch({
            require: false,
        })

        if (!existingUser) {
            return response.status(422).json([
                {
                    field: 'email',
                    message: 'Invalid email address.',
                },
            ])
        }

        const token =
            Randomstring.generate(32) + Uniqid() + Randomstring.generate(32)

        const expiresAt = Dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')

        if (existingPasswordReset) {
            // make sure it has not expired
            await PasswordResetModel.query()
                .where({
                    email,
                })
                .update({
                    token,
                    expires_at: expiresAt,
                })
        } else {
            await PasswordResetModel.forge({
                email,
                token,
            }).save()
        }

        Mailer.to(email, existingUser.get('name')).sendRaw(
            `Some raw message to send with the token ${token}`
        )

        return response.json({
            message: `Please check your email for steps to reset your password.`,
        })
    }

    private resetPassword = async (request: Request, response: Response) => {
        const { body, resources, resourceManager } = request

        const { token, password } = await validateAll(body, {
            token: 'required|string',
            password: 'required|string|min:8',
        })

        const UserModel = resources[this.userResource().data.slug].Model()

        const PasswordResetModel = resources[
            this.passwordResetsResource().data.slug
        ].Model()

        let existingPasswordReset = await PasswordResetModel.where({
            token,
        }).fetch({
            require: false,
        })

        if (!existingPasswordReset) {
            return response.status(422).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.',
                },
            ])
        }

        existingPasswordReset = existingPasswordReset.toJSON()

        if (Dayjs(existingPasswordReset.expires_at).isBefore(Dayjs())) {
            return response.status(422).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.',
                },
            ])
        }

        let user = await UserModel.where({
            email: existingPasswordReset.email,
        }).fetch({
            require: false,
        })

        if (!user) {
            await new PasswordResetModel({
                id: existingPasswordReset.id,
            }).destroy({
                require: false,
            })

            return response.status(500).json({
                message: 'User does not exist anymore.',
            })
        }

        await resourceManager.update(
            request,
            request.resources[this.userResource().data.slug],
            user.get('id'),
            {
                password,
            },
            true
        )

        await new PasswordResetModel({
            id: existingPasswordReset.id,
        }).destroy()

        // TODO: Send an email to the user notifying them
        // that their password was reset.

        response.json({
            message: `Password reset successful.`,
        })
    }

    private validate = async (data: AuthData, registration = false) => {
        let rules: {
            [key: string]: string
        } = {
            email: 'required|email',
            password: 'required|min:8',
        }

        if (registration) {
            rules.name = 'required'
        }

        return await validateAll(data, rules, {
            'email.required': 'The email is required.',
            'password.required': 'The password is required.',
            'name.required': 'The name is required.',
        })
    }

    private generateJwt(payload: object) {
        return Jwt.sign(payload, this.config.jwt.secretKey, {
            expiresIn: this.config.jwt.expiresIn,
        })
    }
}

export const auth = () => new Auth()
