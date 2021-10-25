import { sdk } from '@tensei/sdk'
import { Session, withIronSession } from 'next-iron-session'
import { NextApiRequest, NextApiResponse } from 'next'

export type NextIronRequest = NextApiRequest & { session: Session }

export type NextIronHandler = (
  req: NextIronRequest,
  res: NextApiResponse
) => void | Promise<void>

export const prepareAuthData = (payload: any) => {
  const { refreshToken, ...rest } = payload

  return rest
}

export const getAccessTokenExpiryTimeStamp = (seconds: number) => {
  const now = new Date()

  now.setSeconds(now.getSeconds() + seconds)

  return now
}

// @ts-ignore -> These types will be generated when the user runs the `yarn tensei-sdk g` command.
export const tensei: import('@tensei/sdk').SdkContract = sdk({
  url: process.env.TENSEI_API_URL
})

export function getLoginUrl() {
  return process.env.NEXT_LOGIN_PATH || '/login'
}

export function getProfileUrl() {
  return process.env.NEXT_REDIRECT_IF_AUTHENTICATED_PATH || '/profile'
}

export const wrapErrorHandling = (fn: NextIronHandler): NextIronHandler => {
  return async (req: NextIronRequest, res: NextApiResponse): Promise<void> => {
    try {
      await fn(req, res)
    } catch (error) {
      console.error(error)
      res
        .status(error?.response?.status || error.status || 500)
        .json(error?.response?.data || error.message)
      res.end()
    }
  }
}

export const withSession = (handler: NextIronHandler) => {
  return (withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: 'session/tensei',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  }) as unknown) as NextIronHandler
}
