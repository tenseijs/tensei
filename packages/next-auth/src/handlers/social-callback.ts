import { NextApiResponse } from 'next'

import { NextIronRequest, tensei, getAccessTokenExpiryTimeStamp, prepareAuthData } from '../utils'

export default async function handleSocialCallback(
  request: NextIronRequest,
  response: NextApiResponse
): Promise<void> {
  const apiResponse = await tensei.auth().socialConfirm({
    skipAuthentication: true,
    object: {
        token: request.query.access_token
    },
  })

  request.session.set('auth', {
    refresh_token: apiResponse.data.data.refresh_token,
    access_token_expires_at: getAccessTokenExpiryTimeStamp(apiResponse.data.data.expires_in),
  })

  await request.session.save()

  return response.status(200).json(prepareAuthData(apiResponse.data.data))
}
