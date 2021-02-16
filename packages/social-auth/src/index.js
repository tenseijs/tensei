const grant = require('grant')
const Purest = require('purest')
const crypto = require('crypto')
const Request = require('request')
const ExpressSession = require('express-session')
const purestConfig = require('@purest/providers')
const AsyncHandler = require('express-async-handler')
const ExpressSessionMikroORMStore = require('express-session-mikro-orm')

const purest = Purest({ request: Request })

class SocialAuthCallbackController {
    connect = (
        authConfig) =>
        AsyncHandler(async (request, response) => {
            const { query, params, manager } = request

            const provider = params.provider
            const access_token =
                query.access_token || query.code || query.oauth_token

            const redirect = (error, code) =>
                {
                    const clientRedirect = query.clientCallback ? query.clientCallback: authConfig.providers[provider].clientCallback

                    return response.redirect(
                        `${clientRedirect}${
                            error ? `?error=${error}` : ''
                        }${
                            code ? `?access_token=${code}` : ''
                        }&provider=${provider}`
                    )
                }

            if (!access_token) return redirect(query.error)

            try {
                const [error, providerData] = await this[provider](
                    access_token
                )

                if (!providerData.email)
                    return redirect(
                        `Coud not get user email for provider ${provider}`
                    )

                if (error) return redirect(error)

                const payload = {
                    email: providerData.email,
                    name: providerData.name
                }

                let temporal_token = this.getTemporalToken()

                const db = manager.getRepository(
                    authConfig.resources.oauthIdentity.data.pascalCaseName
                )
                const existingOauthIdentity = await db.findOne(
                    {
                        provider: provider,
                        provider_user_id: providerData.provider_user_id
                    },
                    {
                        fields: ['temporal_token', 'id']
                    }
                )

                if (existingOauthIdentity) {
                    manager.assign(existingOauthIdentity, {
                        temporal_token,
                        access_token
                    })

                    await manager.persistAndFlush(existingOauthIdentity)
                } else {
                    await manager.persistAndFlush(
                        db.create({
                            provider,
                            access_token,
                            temporal_token,
                            email: payload.email,
                            payload: JSON.stringify(payload),
                            provider_user_id: providerData.provider_user_id
                        })
                    )
                }

                return redirect(null, temporal_token)
            } catch (error) {
                console.error(error)
                return redirect(
                    `Something went wrong saving the oauth identity.`
                )
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
                        provider_user_id: body.id
                    }
                    if (error || data.email) {
                        return resolve([error, data])
                    }

                    github
                        .query()
                        .get('user/emails')
                        .auth(token)
                        .request(
                            (emailError, res, emailBody) => {
                                return resolve([
                                    emailError,
                                    {
                                        ...data,
                                        email: Array.isArray(emailBody)
                                            ? emailBody.find(
                                                  email =>
                                                      email.primary === true
                                              ).email
                                            : null
                                    }
                                ])
                            }
                        )
                })
        )
    }

    facebook() {}

    gitlab() {}

    google(access_token) {
        return new Promise(resolve =>
            purest({ provider: 'google', config: purestConfig })
                .query('oauth')
                .get('tokeninfo')
                .qs({ access_token })
                .request((error, res, body) =>
                    resolve([
                        error,
                        {
                            ...body,
                            email: body.email,
                            name: body.email.split('@')[0],
                            provider_user_id: body.user_id
                        }
                    ])
                )
        )
    }

    twitter() {}

    async linkedin(access_token) {
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
                    .auth(access_token)
                    .request((err, res, body) =>
                        resolve([err, body])
                    )
            )

        const getEmailRequest = () =>
            new Promise(resolve => {
                linkedin
                    .query()
                    .get(
                        'emailAddress?q=members&projection=(elements*(handle~))'
                    )
                    .auth(access_token)
                    .request((err, res, body) =>
                        resolve([err, body])
                    )
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
                provider_user_id: detailsBody.id,
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
        orm,
        apiPath,
        serverUrl,
        clientUrl,
        authConfig,
        resourcesMap,
    }) => {
        const Store = ExpressSessionMikroORMStore.default(ExpressSession, {
            entityName: `${resourcesMap.user.data.pascalCaseName}Session`,
            tableName: `${resourcesMap.user.data.snakeCaseNamePlural}_sessions`,
            collection: `${resourcesMap.user.data.snakeCaseNamePlural}_sessions`
        })

        app.use(
            ExpressSession({
                store: new Store({
                    orm: orm
                }),
                resave: false,
                saveUninitialized: false,
                secret:
                    process.env.SESSION_SECRET || '__sessions__secret__'
            })
        )

        Object.keys(authConfig.providers).forEach(provider => {
            const providerConfig = authConfig.providers[provider]
            const clientCallback =
                providerConfig.clientCallback || ''

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
            (new SocialAuthCallbackController()).connect({
                ...authConfig,
                resources: resourcesMap
            })
        )
    }
}
