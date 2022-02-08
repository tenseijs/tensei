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
          currentPassword: 'required',
          newPassword: 'required|min:12'
        },
        {
          'currentPassword.required': 'The current password is required.',
          'newPassword.required': 'The new password is required.',
          'newPassword.min':
            'Please provide a password longer than 12 characters'
        }
      )
    } catch (error) {
      return response.status(422).json({
        errors: error
      })
    }

    const payload = {
      currentPassword: request.body.currentPassword,
      newPassword: request.body.newPassword
    }

    if (!Bcrypt.compareSync(payload.currentPassword, request.user?.password)) {
      return response.status(422).json({
        errors: [
          {
            message: 'Your current password is incorrect',
            field: 'currentPassword'
          }
        ]
      })
    }

    request.user.password = payload.newPassword

    await request.repositories.adminUsers().persistAndFlush(request.user)

    return response.status(204).json()
  })
