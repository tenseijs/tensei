import Bcrypt from 'bcryptjs'
import { route } from '@tensei/common'

export const changePasswordRoute = route('Change password')
  .post()
  .authorize(({ user }) => !!user)
  .handle(async (request, response) => {
    try {
      await request.config.indicative.validator.validateAll(
        request.body,
        {
          password: 'required',
          newPassword: 'required|min:12'
        },
        {
          'password.required': 'The password is required.',
          'newPassword.required': 'The new password is required.'
        }
      )
    } catch (error) {
      return response.status(422).json({
        errors: error
      })
    }

    const payload = {
      password: request.body.password,
      newPassword: request.body.newPassword
    }

    if (!Bcrypt.compareSync(payload.password, request.user?.password)) {
      return response.status(422).json({
        errors: [
          {
            message: 'Your current password is incorrect',
            field: 'password'
          }
        ]
      })
    }

    request.user.password = payload.newPassword

    await request.repositories.adminUsers().persistAndFlush(request.user)

    return response.status(204).json()
  })
