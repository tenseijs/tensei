import { withIronSession } from 'next-iron-session'
import { NextApiHandler, NextApiResponse } from 'next'

import { NextIronHandler, wrapErrorHandling, withSession } from '../utils'

import handleLogin from './login'
import handleLogout from './logout'
import handleSignup from './signup'
import handleCheckSession from './check-session'

export function handleAuth(): NextIronHandler {
  return async function (request, response): Promise<void> {
    let { auth } = request.query

    auth = Array.isArray(auth) ? auth[0] : auth

    const invoke = (handler: NextIronHandler) =>
      wrapErrorHandling(withSession(handler))(request, response)

    switch (auth) {
      case 'login':
        return invoke(handleLogin)
      case 'logout':
        return invoke(handleLogout)
      case 'check-session':
        return invoke(handleCheckSession)
      case 'signup':
        return invoke(handleSignup)
      default:
        response.status(404).end()
    }
  }
}
