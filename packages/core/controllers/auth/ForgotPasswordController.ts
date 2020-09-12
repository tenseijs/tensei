// @ts-nocheck

import Express from 'express'
import Dayjs from 'dayjs'
import Uniqid from 'uniqid'
import Randomstring from 'randomstring'

import { validateAll } from 'indicative/validator'

class ForgotPasswordController {
    public forgotPassword = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { body, resources, mailer, manager } = request
        const { email } = await validateAll(body, {
            email: 'required|email',
        })

        const PasswordResetModel = resources['password-resets'].Model()

        const existingUser = await manager.findUserByEmail(email)

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

        mailer
            .to(email, existingUser.name)
            .sendRaw(`Some raw message to send with the token ${token}`)

        return response.json({
            message: `Please check your email for steps to reset your password.`,
        })
    }

    public resetPassword = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { body, resources, manager, mailer } = request

        const { token, password } = await validateAll(body, {
            token: 'required|string',
            password: 'required|string|min:8',
        })

        const PasswordResetModel = resources['password-resets'].Model()

        let existingPasswordReset = await PasswordResetModel.where({
            token,
        }).fetch({
            require: false,
        })

        if (!existingPasswordReset) {
            return response.status(401).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.',
                },
            ])
        }

        existingPasswordReset = existingPasswordReset.toJSON()

        if (Dayjs(existingPasswordReset.expires_at).isBefore(Dayjs())) {
            return response.status(401).json([
                {
                    field: 'token',
                    message: 'Invalid reset token.',
                },
            ])
        }

        const user = await manager.findUserByEmail(existingPasswordReset.email)

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

        await manager.update(
            request,
            resources['administrators'],
            user.id,
            {
                password,
            },
            true
        )

        await new PasswordResetModel({
            id: existingPasswordReset.id,
        }).destroy()

        mailer
            .to(user.email, user.name)
            .sendRaw(`Your password has been changed successfully`)

        response.json({
            message: `Password reset successful.`,
        })
    }
}

export default new ForgotPasswordController()
