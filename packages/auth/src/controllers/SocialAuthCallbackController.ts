import Axios from 'axios'
import Purest from 'purest'
import Request from 'request'
import { Config } from '@tensei/common'
import { RequestHandler } from 'express'
import purestConfig from '@purest/providers'
import { AuthPluginConfig, SupportedSocialProviders } from 'config'

const purest = require('purest')({ request: Axios, promise: Promise })

class SocialAuthCallbackController {
    public connect = (
        config: Config,
        authConfig: AuthPluginConfig
        // @ts-ignore
    ): RequestHandler => async ({ query, params, session }, response) => {
        const provider = params.provider as SupportedSocialProviders
        const accessToken =
            query.access_token || query.code || query.oauth_token

            // @ts-ignore
        console.log('xxxxx-=============', session, query) 

        if (!accessToken) {
            // TODO: Redirect user back to client side
            const clientCallback = authConfig.providers[provider].clientCallback
            // return response.redirect(
            //     `${config.clientUrl}${
            //         config.clientUrl.endsWith('/') ? '' : '/'
            //     }${
            //         !config.clientUrl.endsWith('/') &&
            //         clientCallback.startsWith('/')
            //             ? ''
            //             : '/'
            //     }${clientCallback}?code=${accessToken}`
            // )
        }

        switch (provider) {
            case 'github':
                const [error, body]: any = await this.github(accessToken as string)

                console.log('>>>>>>>>>>>>>---------->.', body, error)

                break;
            default:
                break;
        }

        response.json('Done')
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

        return new Promise((resolve) => github.query().get('user').auth(token).request((error: any, res: any, body: any) => {
            if (error) {
                return resolve([error])
            }

            return resolve([null, body])
        }))
    }

    private linkedIn() {}

    private facebook() {}

    private gitlab() {}
}

export default new SocialAuthCallbackController()
