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

        const user = await request.manager('administrators').findOneByField('email', request.body.email)

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

        if (!Bcrypt.compareSync(request.body.password, user?.password || '')) {
            return wrongCredentials()
        }

        request.session!.user = user.id

        response.status(200).json({
            message: 'Login successful.',
        })
    }

    public register = async (
        { manager, body, resources, session }: Express.Request,
        response: Express.Response
    ) => {
        if ((await manager('administrators').findAllCount()) > 0) {
            return response.status(422).json({
                message:
                    'An administrator user already exists. Please use the administration management dashboard to add more users.',
            })
        }

        const roleResource = resources['administrator-roles']

        if (!roleResource) {
            throw {
                message: `The role resource must be registered.`,
                status: 422,
            }
        }

        const superAdmin = await manager(roleResource.data.slug).findOneByField(
            'slug',
            'super-admin'
        )

        if (!superAdmin) {
            throw {
                message: `The super-admin role must be setup before creating an administrator user.`,
                status: 422,
            }
        }

        const { id } = await manager('administrators').create({
            ...body,
            administrator_roles: [superAdmin.id],
        })

        session!.user = id

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
