import { route, User } from '@tensei/common'
import { Request, Response } from 'express'
import crypto from 'crypto'

export const inviteMember = route('Invite Member')
  .post()
  .authorize(({ user }) => !!user)
  .handle(async (request: Request, response: Response) => {

    // sample data to create member from dev mode on browser
    // using window.Tensei.api.post('auth/invite-member') only
    // to be removed later
    request.body = {
      firstName: 'Jay',
      lastName: 'Riven',
      email: 'jayriven@mail.com',
      adminRoles: ["2", "3"]
    }

    const { config, manager, resources, body, repositories } = request

    try {
      await request.config.indicative.validator.validateAll(
        body,
        {
          firstName: 'required',
          lastName: 'required',
          email: 'required|email',
          adminRoles: 'required|array'
        },
        {
          'firstName.required': 'The first name is required.',
          'lastName.required': 'The last name is required.',
          'email.required': 'The email is required.',
          'email.email': 'Please provide a valid email.',
          'adminRoles.required': 'The role is required.',
          'adminRoles.array': 'The role must be an array of role id.'
        }
      )

      // check that email does not exist
      const emailExists = await repositories.adminUsers().findOne({ email: body.email })

      if (emailExists?.email) {
        return response.status(422).json({
          errors: [{
            message: 'The email has already been taken.',
            validation: 'unique',
            field: 'email'
          }]
        })
      }
    } catch (error) {
      return response.status(422).json({
        errors: error
      })
    }

    const inviteCode = crypto.randomBytes(32).toString('hex')

    // verify roles
    const roles = await repositories.adminRoles().find({
      id: {
        $in: body?.adminRoles
      }
    })

    if (roles.length === 0) {
      return response.status(422).json({
        errors: [{
          message: 'The role is required.',
          validation: 'required',
          field: 'adminRoles'
        }]
      })
    }

    let payload: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      inviteCode: inviteCode,
      adminRoles: [...roles],
      active: false
    }

    const admin: User = manager.create(
      resources.AdminUser.data.pascalCaseName,
      payload
    )

    await manager.persistAndFlush(admin)

    return response.status(200).json(admin)

  })
