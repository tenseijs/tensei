const grant = require('grant')
const Purest = require('purest')
const crypto = require('crypto')
const Request = require('request')
const purestConfig = require('@purest/providers')
const AsyncHandler = require('express-async-handler')

const purest = Purest({ request: Request })

class SocialAuthCallbackController {
  connect = authConfig =>
    AsyncHandler(async (request, response) => {
      const { query, params, manager } = request

      const provider = params.provider
      const accessToken = query.accessToken || query.code || query.oauth_token

      const redirect = (error, code) => {
        const clientRedirect = query.clientCallback
          ? query.clientCallback
          : authConfig.providers[provider].clientCallback

        return response.redirect(
          `${clientRedirect}${error ? `?error=${error}` : ''}${
            code ? `?accessToken=${code}` : ''
          }&provider=${provider}`
        )
      }

      if (!accessToken) return redirect(query.error)

      try {
        const [error, providerData] = await this[provider](accessToken)

        if (!providerData.email)
          return redirect(`Coud not get user email for provider ${provider}`)

        if (error) return redirect(error)

        const payload = {
          email: providerData.email,
          ...(authConfig.getUserPayloadFromProviderData
            ? authConfig.getUserPayloadFromProviderData(providerData)
            : {})
        }

        let temporalToken = this.getTemporalToken()

        const db = manager.getRepository(
          authConfig.resources.oauthIdentity.data.pascalCaseName
        )
        const existingOauthIdentity = await db.findOne(
          {
            provider: provider,
            providerUserId: providerData.providerUserId.toString()
          },
          {
            fields: ['temporalToken', 'id']
          }
        )

        if (existingOauthIdentity) {
          manager.assign(existingOauthIdentity, {
            temporalToken,
            accessToken
          })

          await manager.persistAndFlush(existingOauthIdentity)
        } else {
          await manager.persistAndFlush(
            db.create({
              provider,
              accessToken,
              temporalToken,
              email: payload.email,
              payload: JSON.stringify(payload),
              providerUserId: providerData.providerUserId.toString()
            })
          )
        }

        return redirect(null, temporalToken)
      } catch (error) {
        console.error(error)
        return redirect(`Something went wrong saving the oauth identity.`)
      }
    })

  getTemporalToken(length = 32) {
    return crypto.randomBytes(length).toString('hex')
  }

  async github(token) {
    const github = purest({
      provider: 'github',
      config: purestConfig,
      defaults: {
        headers: {
          'user-agent': 'tensei'
        }
      }
    })

    return new Promise(resolve =>
      github
        .query()
        .get('user')
        .auth(token)
        .request((error, res, body) => {
          const data = {
            ...body,
            name: body.name,
            email: body.email,
            providerUserId: body.id
          }
          if (error || data.email) {
            return resolve([error, data])
          }

          github
            .query()
            .get('user/emails')
            .auth(token)
            .request((emailError, res, emailBody) => {
              return resolve([
                emailError,
                {
                  ...data,
                  email: Array.isArray(emailBody)
                    ? emailBody.find(email => email.primary === true).email
                    : null
                }
              ])
            })
        })
    )
  }

  facebook() {}

  gitlab() {}

  google(accessToken) {
    return new Promise(resolve =>
      purest({ provider: 'google', config: purestConfig })
        .query('oauth')
        .get('tokeninfo')
        .qs({ accessToken })
        .request((error, res, body) =>
          resolve([
            error,
            {
              ...body,
              email: body.email,
              name: body.email.split('@')[0],
              providerUserId: body.user_id
            }
          ])
        )
    )
  }

  twitter() {}

  async linkedin(accessToken) {
    const linkedin = purest({
      provider: 'linkedin',
      config: {
        linkedin: {
          'https://api.linkedin.com': {
            __domain: {
              auth: [{ auth: { bearer: '[0]' } }]
            },
            '[version]/{endpoint}': {
              __path: {
                alias: '__default',
                version: 'v2'
              }
            }
          }
        }
      }
    })

    const getDetailsRequest = () =>
      new Promise(resolve =>
        linkedin
          .query()
          .get('me')
          .auth(accessToken)
          .request((err, res, body) => resolve([err, body]))
      )

    const getEmailRequest = () =>
      new Promise(resolve => {
        linkedin
          .query()
          .get('emailAddress?q=members&projection=(elements*(handle~))')
          .auth(accessToken)
          .request((err, res, body) => resolve([err, body]))
      })

    const [
      [detailsError, detailsBody],
      [emailError, emailBody]
    ] = await Promise.all([getDetailsRequest(), getEmailRequest()])

    return [
      detailsError || emailError,
      {
        ...detailsBody,
        ...emailBody,
        providerUserId: detailsBody.id,
        email: emailBody.elements[0]['handle~'].emailAddress,
        name: `${detailsBody.localizedFirstName} ${detailsBody.localizedLastName}`
      }
    ]
  }
}

module.exports = {
  controller: new SocialAuthCallbackController(),
  register: ({
    app,
    apiPath,
    serverUrl,
    clientUrl,
    authConfig,
    resourcesMap,
    getUserPayloadFromProviderData
  }) => {
    Object.keys(authConfig.providers).forEach(provider => {
      const providerConfig = authConfig.providers[provider]
      const clientCallback = providerConfig.clientCallback || ''

      authConfig.providers[provider] = {
        ...providerConfig,
        redirect_uri: `${serverUrl}/connect/${provider}/callback`,
        clientCallback: clientCallback.startsWith('http')
          ? clientCallback
          : `${clientUrl}${
              clientCallback.startsWith('/') ? '/' : ''
            }${clientCallback}`
      }
    })

    app.use(grant.express()(authConfig.providers))

    app.get(
      `/${apiPath}/:provider/callback`,
      new SocialAuthCallbackController().connect({
        ...authConfig,
        getUserPayloadFromProviderData,
        resources: resourcesMap
      })
    )
  }
}
