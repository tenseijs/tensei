import { route } from '@tensei/common'

export const updateProfileRoute = route('Update Profile')
  .patch()
  .authorize(({ user }) => !!user)
  .handle(async (request, response) => {
    try {
      await request.config.indicative.validator.validateAll(
        request.body,
        {
          firstName: 'required',
          lastName: 'required',
          email: 'required|email'
        },
        {
          'firstName.required': 'The first name is required.',
          'lastName.required': 'The last name is required.',
          'email.required': 'The email is required.',
          'email.email': 'Please provide a valid email.'
        }
      )
    } catch (error) {
      return response.status(422).json({
        errors: error
      })
    }

    const payload = {
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email
    }

    if (payload.firstName) {
      request.user.firstName = payload.firstName
    }

    if (payload.lastName) {
      request.user.lastName = payload.lastName
    }

    if (payload.email) {
      request.user.email = payload.email
    }

    await request.repositories.adminUsers().persistAndFlush(request.user)

    return response.status(204).json()
  })
