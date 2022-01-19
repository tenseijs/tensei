import { route, User } from '@tensei/common'
import { Request, Response } from 'express'

export const verifyInviteCode = route('Verify Invite Code')
  .get()
  .noCsrf()
  .handle(async (request: Request, response: Response) => {
    const { params, repositories } = request

    const invitedMember: User = await repositories.adminUsers().findOne({ inviteCode: request.params.invite, active: false })

    return response.status(invitedMember ? 200 : 404).json(invitedMember)
  })
