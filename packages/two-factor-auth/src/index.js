const Qr = require('qrcode')
const Speakeasy = require('speakeasy')

const validateTwoFactorToken = async validator => {
  try {
    return [true, await validator()]
  } catch (error) {
    return [false, error]
  }
}

module.exports = {
  verifyTwoFactorAuthToken: async ({ userInputError, authUser }, token) => {
    if (!authUser.twoFactorEnabled) {
      throw userInputError(`You do not have two factor authentication enabled.`)
    }

    const verified = Speakeasy.totp.verify({
      encoding: 'base32',
      token,
      secret: authUser.twoFactorSecret
    })

    return verified
  },
  disableTwoFactorAuth: async ({ userInputError, manager, body, authUser }) => {
    if (!authUser.twoFactorEnabled) {
      throw userInputError(`You do not have two factor authentication enabled.`)
    }

    const verified = Speakeasy.totp.verify({
      encoding: 'base32',
      token: body.object ? body.object.token : body.token,
      secret: authUser.twoFactorSecret
    })

    if (!verified) {
      throw userInputError(`Invalid two factor authentication code.`)
    }

    manager.assign(authUser, {
      twoFactorSecret: null,
      twoFactorEnabled: false
    })

    await manager.persistAndFlush(authUser)

    return authUser.toJSON()
  },
  confirmEnableTwoFactorAuth: async ({
    authUser,
    body,
    manager,
    indicative,
    userInputError
  }) => {
    const Speakeasy = require('speakeasy')

    const [passed, payload] = await validateTwoFactorToken(() =>
      indicative.validator.validateAll(body.object ? body.object : body, {
        token: 'required|string'
      })
    )

    if (!passed) {
      throw userInputError(`Validation failed.`, {
        errors: payload
      })
    }

    if (!authUser.twoFactorSecret) {
      throw userInputError(`You must enable two factor authentication first.`)
    }

    const verified = Speakeasy.totp.verify({
      encoding: 'base32',
      token: payload.token,
      secret: authUser.twoFactorSecret
    })

    if (!verified) {
      throw userInputError(`Invalid two factor token.`)
    }

    manager.assign(authUser, {
      twoFactorEnabled: true
    })

    await manager.persistAndFlush(authUser)

    return authUser.toJSON()
  },
  enableTwoFactorAuth: async ({ authUser, manager }) => {
    const { base32, ascii } = Speakeasy.generateSecret()

    manager.assign(authUser, {
      twoFactorSecret: base32,
      twoFactorEnabled: null
    })

    await manager.persistAndFlush(authUser)

    return new Promise((resolve, reject) =>
      Qr.toDataURL(
        Speakeasy.otpauthURL({
          secret: ascii,
          label: authUser.email,
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
            user: authUser.toJSON()
          })
        }
      )
    )
  }
}
