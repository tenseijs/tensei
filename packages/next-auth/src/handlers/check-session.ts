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

  if (!auth || !auth.refresh_token) {
    return response.status(200).json({})
  }

  let apiResponse

  try {
    apiResponse = await tensei.auth().refreshToken({
      token: auth.refresh_token
    })
  } catch (error) {
    // Terminate the existing session.
    request.session.destroy()

    return response.status(200).json({})
  }

  request.session.set('auth', {
    refresh_token: apiResponse.data.data.refresh_token,
    access_token_expires_at: getAccessTokenExpiryTimeStamp(
      apiResponse.data.data.expires_in
    )
  })

  await request.session.save()

  return response.status(200).json(prepareAuthData(apiResponse.data.data))
}
