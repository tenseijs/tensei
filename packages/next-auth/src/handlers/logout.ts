import { NextApiResponse } from 'next'

import { NextIronRequest, tensei } from '../utils'

export default async function handleLogout(
  request: NextIronRequest,
  response: NextApiResponse
): Promise<void> {
  request.session.destroy()

  await tensei.auth().logout()

  response.status(204).json({})
}
