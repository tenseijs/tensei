import Express from 'express'
import Bcrypt from 'bcryptjs'
import { validateAll } from 'indicative/validator'

type AuthData = { email: string; password: string; name?: string }

class AuthController {
    public logout = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        request.session!.destroy(() => {
            response.status(200).json({
                message: 'Logout successful.',
            })
        })
    }

    public login = async (
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

        const user = await request.db.findUserByEmail(request.body.email)

        if (request.body.rememberMe) {
            request.session!.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
        }

        const wrongCredentials = () =>
            response.status(422).json({
                message: 'Validation failed.',
                errors: [
                    {
                        message: 'These credentials do not match our records.',
                        field: 'email',
                    },
                ],
            })

        if (!user) {
            return wrongCredentials()
        }

        if (!Bcrypt.compareSync(request.body.password, user.password)) {
            return wrongCredentials()
        }

        request.session!.user = user.id

        response.status(200).json({
            message: 'Login successful.',
        })
    }

    public register = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        if ((await request.db.getAdministratorsCount()) > 0) {
            return response.status(422).json({
                message:
                    'An administrator user already exists. Please use the administration management dashboard to add more users.',
            })
        }

        const [validationPassed, errors] = await this.validate(
            request.body,
            true
        )

        if (!validationPassed) {
            return response.status(422).json({
                message: 'Validation failed.',
                errors,
            })
        }

        const userId = await request.resourceManager.createAdmin(
            request,
            request.administratorResource,
            {
                name: request.body.name,
                email: request.body.email,
                password: request.body.password,
            }
        )

        request.session!.user = userId

        return response.json({
            message: 'Registration and login successful.',
        })
    }

    public validate = async (data: AuthData, registration = false) => {
        let rules: {
            [key: string]: string
        } = {
            email: 'required|email',
            password: 'required|min:8',
        }

        if (registration) {
            rules.name = 'required'
        }

        try {
            await validateAll(data, rules, {
                'email.required': 'The email is required.',
                'password.required': 'The password is required.',
                'name.required': 'The name is required.',
            })

            return [true, []]
        } catch (errors) {
            return [false, errors]
        }
    }
}

export default new AuthController()
