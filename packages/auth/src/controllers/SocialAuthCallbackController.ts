import Dayjs from 'dayjs'
import Uniqid from 'uniqid'
import Purest from 'purest'
import Request from 'request'
import Random from 'randomstring'
import { Config, DataPayload } from '@tensei/common'
import { RequestHandler, request } from 'express'
import purestConfig from '@purest/providers'
import AsyncHandler from 'express-async-handler'
import { AuthPluginConfig, SupportedSocialProviders } from 'config'

const purest = Purest({ request: Request })

class SocialAuthCallbackController {
    public connect = (
        config: Config,
        authConfig: AuthPluginConfig
    ): RequestHandler =>
        AsyncHandler(async (request, response) => {
            const { query, params, manager } = request

            const provider = params.provider as SupportedSocialProviders
            const access_token =
                query.access_token || query.code || query.oauth_token

            const redirect = (error?: any, code?: string) =>
                response.redirect(
                    `${authConfig.providers[provider].clientCallback}${
                        error ? `?error=${error}` : ''
                    }${
                        code ? `?access_token=${code}` : ''
                    }&provider=${provider}`
                )

            if (!access_token) return redirect(query.error)

            try {
                const [error, providerData]: any = await this[provider](
                    access_token as string
                )

                if (!providerData.email)
                    return redirect(
                        `Coud not get user email for provider ${provider}`
                    )

                if (error) return redirect(error)

                const payload = authConfig.beforeOAuthIdentityCreated
                    ? authConfig.beforeOAuthIdentityCreated(
                          providerData,
                          request
                      )
                    : {
                          email: providerData.email,
                          name: providerData.name,
                      }

                let temporal_token = this.getTemporalToken()

                const db = manager('Oauth Identity')
                const existingOauthIdentity = await db.database().findAll({
                    filters: [
                        {
                            field: 'provider',
                            value: provider,
                            operator: 'equals',
                        },
                        {
                            field: 'provider_user_id',
                            value: providerData.provider_user_id,
                            operator: 'equals',
                        },
                    ],
                    fields: ['temporal_token', 'id'],
                    perPage: 1,
                })

                if (existingOauthIdentity.data.length > 0) {
                    await db.database().update(
                        existingOauthIdentity.data[0].id,
                        {
                            temporal_token,
                            access_token,
                        },
                        {},
                        true
                    )
                } else {
                    await db.database().create({
                        provider,
                        access_token,
                        temporal_token,
                        email: payload.email,
                        payload: JSON.stringify(payload),
                        provider_user_id: providerData.provider_user_id,
                    })
                }

                return redirect(null, temporal_token)
            } catch (error) {
                return redirect(
                    `Something went wrong saving the oauth identity.`
                )
            }
        })

    private getTemporalToken() {
        return Random.generate(24) + Uniqid() + Random.generate(24)
    }

    private async github(token: string) {
        const github = purest({
            provider: 'github',
            config: purestConfig,
            defaults: {
                headers: {
                    'user-agent': 'tensei',
                },
            },
        })

        return new Promise((resolve) =>
            github
                .query()
                .get('user')
                .auth(token)
                .request((error: any, res: any, body: any) => {
                    const data = {
                        ...body,
                        name: body.name,
                        email: body.email,
                        provider_user_id: body.id,
                    }
                    if (error || data.email) {
                        return resolve([error, data])
                    }

                    github
                        .query()
                        .get('user/emails')
                        .auth(token)
                        .request(
                            (emailError: any, res: any, emailBody: any) => {
                                return resolve([
                                    emailError,
                                    {
                                        ...data,
                                        email: Array.isArray(emailBody)
                                            ? emailBody.find(
                                                  (email) =>
                                                      email.primary === true
                                              ).email
                                            : null,
                                    },
                                ])
                            }
                        )
                })
        )
    }

    private facebook() {}

    private gitlab() {}

    private google(access_token: string) {
        return new Promise((resolve) =>
            purest({ provider: 'google', config: purestConfig })
                .query('oauth')
                .get('tokeninfo')
                .qs({ access_token })
                .request((error: any, res: any, body: any) =>
                    resolve([
                        error,
                        {
                            ...body,
                            email: body.email,
                            name: body.email.split('@')[0],
                            provider_user_id: body.user_id,
                        },
                    ])
                )
        )
    }

    private twitter() {}

    private async linkedin(access_token: string) {
        const linkedin = purest({
            provider: 'linkedin',
            config: {
                linkedin: {
                    'https://api.linkedin.com': {
                        __domain: {
                            auth: [{ auth: { bearer: '[0]' } }],
                        },
                        '[version]/{endpoint}': {
                            __path: {
                                alias: '__default',
                                version: 'v2',
                            },
                        },
                    },
                },
            },
        })

        const getDetailsRequest = () =>
            new Promise((resolve) =>
                linkedin
                    .query()
                    .get('me')
                    .auth(access_token)
                    .request((err: any, res: any, body: any) =>
                        resolve([err, body])
                    )
            )

        const getEmailRequest = () =>
            new Promise((resolve) => {
                linkedin
                    .query()
                    .get(
                        'emailAddress?q=members&projection=(elements*(handle~))'
                    )
                    .auth(access_token)
                    .request((err: any, res: any, body: any) =>
                        resolve([err, body])
                    )
            })

        const [
            [detailsError, detailsBody],
            [emailError, emailBody],
        ]: any = await Promise.all([getDetailsRequest(), getEmailRequest()])

        return [
            detailsError || emailError,
            {
                ...detailsBody,
                ...emailBody,
                provider_user_id: detailsBody.id,
                email: emailBody.elements[0]['handle~'].emailAddress,
                name: `${detailsBody.localizedFirstName} ${detailsBody.localizedLastName}`,
            },
        ]
    }
}

export default new SocialAuthCallbackController()
