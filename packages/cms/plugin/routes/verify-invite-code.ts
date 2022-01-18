import { route, User } from '@tensei/common'
import { Request, Response } from 'express'

export const verifyInviteCode = route('Verify Invite Code')
  .post()
  .noCsrf()
  .handle(async (request: Request, response: Response) => {

    const { body, repositories } = request

    try {
      await request.config.indicative.validator.validateAll(
        body,
        {
          inviteCode: 'required'
        },
        {
          'inviteCode.required': 'The invite code is required.'
        }
      )
    } catch (error) {
      return response.status(422).json({
        errors: error
      })
    }

    // check that email does not exist
    const invitedMember: User = await repositories.adminUsers().findOne({ inviteCode: body.inviteCode })

    if (!!invitedMember?.email == false) {
      return response.status(422).json({
        errors: [{
          message: 'The invite code is invalid.',
          validation: 'required',
          field: 'inviteCode'
        }]
      })
    }

    return response.status(200).json(invitedMember)

  })
