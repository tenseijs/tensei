import React from 'react'
import { mustBeNotAuthenticated } from '~/store/auth'
import {
    TextField,
    Button,
    CheckboxField,
} from '@contentful/forma-36-react-components'

class LoginPage extends React.Component {
    state = {
        email: '',
        errors: {},
        password: '',
        isLoading: false,
        rememberMe: false,
    }

    login = (submitEvent) => {
        submitEvent.preventDefault()

        this.setState({
            isLoading: true,
        })

        Flamingo.request
            .post('login', {
                email: this.state.email,
                password: this.state.password,
                rememberMe: this.state.rememberMe,
            })
            .then(() => {
                window.location.href = Flamingo.getPath('')
            })
            .catch((error) => {
                if (error?.response?.status === 422) {
                    this.setState({
                        isLoading: false,
                        errors: this.flattenErrors(error.response.data.errors),
                    })
                }
            })
    }

    flattenErrors = (errors) => {
        const flatErrors = {}

        errors.forEach((error) => {
            flatErrors[error.field] = error.message
        })

        return flatErrors
    }

    render() {
        return (
            <div className="w-full bg-gray-100 h-screen">
                <div className="max-w-md mx-auto pt-20 md:px-0 px-5">
                    <div className="flex justify-center mb-5">
                        <img
                            src="https://strapi.katifrantz.com/admin/3f6f46544e110a51499353fdc9d12bfe.png"
                            className="h-10"
                            alt="company-logo"
                        />
                    </div>
                    <div className="border-t-2 border-blue-primary bg-white shadow-md py-8 px-8">
                        <form onSubmit={this.login} action="">
                            <TextField
                                labelText="Email"
                                name="email"
                                id="email"
                                textInputProps={{
                                    type: 'email',
                                }}
                                value={this.state.email}
                                placeholder="john@doe.com"
                                validationMessage={this.state.errors.email}
                                onChange={(event) =>
                                    this.setState({ email: event.target.value })
                                }
                            />
                            <TextField
                                textInputProps={{
                                    type: 'password',
                                }}
                                labelText="Password"
                                name="password"
                                id="password"
                                className="mt-4"
                                validationMessage={this.state.errors.password}
                                value={this.state.password}
                                onChange={(event) =>
                                    this.setState({
                                        password: event.target.value,
                                    })
                                }
                            />

                            <div className="mt-8 flex justify-between items-center">
                                <CheckboxField
                                    onChange={(event) =>
                                        this.setState({
                                            rememberMe: event.target.checked,
                                        })
                                    }
                                    checked={this.state.rememberMe}
                                    labelText="Remember me"
                                    id="rememberMe"
                                    name="rememberMe"
                                />

                                <Button
                                    type="submit"
                                    buttonType="primary"
                                    disabled={this.state.isLoading}
                                    loading={this.state.isLoading}
                                >
                                    Sign in
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default mustBeNotAuthenticated(LoginPage)
