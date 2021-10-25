import { NextApiResponse } from 'next'

import {
  NextIronRequest,
  tensei,
  getAccessTokenExpiryTimeStamp,
  prepareAuthData
} from '../utils'

export default async function handleLogin(
  request: NextIronRequest,
  response: NextApiResponse
): Promise<void> {
  const apiResponse = await tensei.auth().login({
    skipAuthentication: true,
    object: {
      email: request.body.email,
      password: request.body.password
    }
  })

  request.session.set('auth', {
    refreshToken: apiResponse.data.data.refreshToken,
    accessTokenExpiresAt: getAccessTokenExpiryTimeStamp(
      apiResponse.data.data.expiresIn
    )
  })

  await request.session.save()

  return response.status(200).json(prepareAuthData(apiResponse.data.data))
}
