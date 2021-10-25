import { NextApiResponse } from 'next'
import {
  NextIronRequest,
  tensei,
  getAccessTokenExpiryTimeStamp,
  prepareAuthData
} from '../utils'

export default async function handleCheckSession(
  request: NextIronRequest,
  response: NextApiResponse
) {
  const auth = request.session.get('auth')

  if (!auth || !auth.refreshToken) {
    return response.status(200).json({})
  }

  let apiResponse

  try {
    apiResponse = await tensei.auth().refreshToken({
      token: auth.refreshToken
    })
  } catch (error) {
    // Terminate the existing session.
    request.session.destroy()

    return response.status(200).json({})
  }

  request.session.set('auth', {
    refreshToken: apiResponse.data.data.refreshToken,
    accessTokenExpiresAt: getAccessTokenExpiryTimeStamp(
      apiResponse.data.data.expiresIn
    )
  })

  await request.session.save()

  return response.status(200).json(prepareAuthData(apiResponse.data.data))
}
