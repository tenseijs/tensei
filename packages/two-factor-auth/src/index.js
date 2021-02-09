const Qr = require('qrcode')
const Speakeasy = require('speakeasy')

module.exports = {
    verifyTwoFactorAuthToken: async ({ userInputError, user }, token) => {
        if (!user.two_factor_enabled) {
            throw userInputError(
                `You do not have two factor authentication enabled.`
            )
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token,
            secret: user.two_factor_secret
        })

        return verified
    },
    disableTwoFactorAuth: async ({ userInputError, manager, body, user }) => {
        if (!user.two_factor_enabled) {
            throw userInputError(
                `You do not have two factor authentication enabled.`
            )
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: body.object ? body.object.token : body.token,
            secret: user.two_factor_secret
        })

        if (!verified) {
            throw userInputError(`Invalid two factor authentication code.`)
        }

        manager.assign(user, {
            two_factor_secret: null,
            two_factor_enabled: false
        })

        await manager.persistAndFlush(user)

        return user.toJSON()
    },
    confirmEnableTwoFactorAuth: async ({ 
        user,
        body,
        manager,
        indicative,
        userInputError
     }) => {
        const Speakeasy = require('speakeasy')

        const payload = await indicative.validator.validateAll(body.object ? body.object : body, {
            token: 'required|number'
        })

        if (!user.two_factor_secret) {
            throw userInputError(
                `You must enable two factor authentication first.`
            )
        }

        const verified = Speakeasy.totp.verify({
            encoding: 'base32',
            token: payload.token,
            secret: user.two_factor_secret
        })

        if (!verified) {
            throw userInputError(`Invalid two factor token.`)
        }

        manager.assign(user, {
            two_factor_enabled: true
        })

        await manager.persistAndFlush(user)

        return user.toJSON()
    },
    enableTwoFactorAuth: async ({ user, manager }) => {
        const { base32, ascii } = Speakeasy.generateSecret()

        manager.assign(user, {
            two_factor_secret: base32,
            two_factor_enabled: null
        })

        await manager.persistAndFlush(user)

        return new Promise((resolve, reject) =>
            Qr.toDataURL(
                Speakeasy.otpauthURL({
                    secret: ascii,
                    label: user.email,
                    issuer: process.env.APP_NAME || 'Tensei'
                }),
                (error, dataURL) => {
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
}
