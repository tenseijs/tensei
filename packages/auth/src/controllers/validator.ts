import { validateAll } from 'indicative/validator'

type AuthData = { email: string; password: string; name?: string }

export default async (data: AuthData, registration = false) => {
    let rules: {
        [key: string]: string
    } = {
        email: 'required|email',
        password: 'required|min:8'
    }

    if (registration) {
        rules.name = 'required'
    }

    try {
        await validateAll(data, rules, {
            'email.required': 'The email is required.',
            'password.required': 'The password is required.',
            'name.required': 'The name is required.'
        })

        return [true, []]
    } catch (errors) {
        return [false, errors]
    }
}
