import Express from 'express'
import { validateAll } from 'indicative/validator'

class LoginController {
  public store = async (request: Express.Request, response: Express.Response) => {
    const [validationPassed, errors] = await this.validate(request.body)

    if (! validationPassed) {
        return response.status(400).json({
            message: 'Validation failed.',
            errors
        })
    }

    response.status(400).json({
      message: 'failed.',
    })
  }

  public validate = async (data: {
      username: string
      password: string
  }) => {
      try {
        await validateAll(data, {
            username: 'required',
            password: 'required'
        }, {
            'username.required': 'The username is required.',
            'password.required': 'The password is required.'
        })

        return [true, []]

      } catch (errors) {
        return [false, errors]
      }
  }
}

export default new LoginController()
