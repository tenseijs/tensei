import { NextApiResponse } from 'next'

import {
  NextIronRequest,
  tensei,
  getAccessTokenExpiryTimeStamp,
  getProfileUrl
} from '../utils'

export default async function handleSocialCallback(
  request: NextIronRequest,
  response: NextApiResponse
): Promise<void> {
  const apiResponse = await tensei.auth().socialConfirm({
    skipAuthentication: true,
    object: {
      accessToken: request.query.accessToken
    }
  })

  request.session.set('auth', {
    refresh_token: apiResponse.data.data.refresh_token,
    access_token_expires_at: getAccessTokenExpiryTimeStamp(
      apiResponse.data.data.expires_in
    )
  })

  await request.session.save()

  response.writeHead(302, {
    Location: getProfileUrl()
  })

  response.end()
}
