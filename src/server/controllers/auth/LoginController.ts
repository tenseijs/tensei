import Express from 'express'
import Bcrypt from 'bcryptjs'
import { validateAll } from 'indicative/validator'

class LoginController {
    public store = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const [validationPassed, errors] = await this.validate(request.body)

        if (!validationPassed) {
            return response.status(422).json({
                message: 'Validation failed.',
                errors,
            })
        }

        const user = await request.db.admin().findOne({
            email: request.body.email,
        })

        if (request.body.rememberMe) {
            request.session!.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
        }

        if (
            !user ||
            !Bcrypt.compareSync(request.body.password, user.password)
        ) {
            return response.status(422).json({
                message: 'Validation failed.',
                errors: [
                    {
                        message: 'These credentials do not match our records.',
                        field: 'email',
                    },
                ],
            })
        }

        request.session!.user = user

        response.status(200).json({
            user,
        })
    }

    public validate = async (data: { email: string; password: string }) => {
        try {
            await validateAll(
                data,
                {
                    email: 'required',
                    password: 'required',
                },
                {
                    'email.required': 'The email is required.',
                    'password.required': 'The password is required.',
                }
            )

            return [true, []]
        } catch (errors) {
            return [false, errors]
        }
    }
}

export default new LoginController()
