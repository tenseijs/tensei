import { route, User } from '@tensei/common'
import { Request, Response } from 'express'
import crypto from 'crypto'

export const inviteMember = route('Invite Member')
  .post()
  .authorize(({ user }) => !!user)
  .handle(async (request: Request, response: Response) => {

    const { config, manager, body, resources } = request
    const { emitter } = config

    try {
      await request.config.indicative.validator.validateAll(
        body,
        {
          firstName: 'required',
          lastName: 'required',
          email: 'required|email|unique',
          adminRoles: 'required|array'
        },
        {
          'firstName.required': 'The first name is required.',
          'lastName.required': 'The last name is required.',
          'email.required': 'The email is required.',
          'email.email': 'Please provide a valid email.',
          'email.unique': 'An administrator already exists with this email.',
          'roles.required': 'The role is required.'
        }
      )
    } catch (error) {
      return response.status(422).json({
        errors: error
      })
    }

    const inviteCode = crypto.randomBytes(32).toString('hex')

    let payload: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      inviteCode: inviteCode,
      adminRoles: [...body?.roles],
      active: false
    }

    const admin: User = manager.create(
      resources.user.data.pascalCaseName,
      payload
    )

    await manager.persistAndFlush(admin)

    emitter.emit('ADMIN_REGISTERED', admin)

    return response.status(204).json(admin)

  })
