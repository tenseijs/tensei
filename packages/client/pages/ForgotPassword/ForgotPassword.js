import React from 'react'
import { mustBeNotAuthenticated } from '~/store/auth'
import { TextField, Button } from '@contentful/forma-36-react-components'

class ForgotPasswordPage extends React.Component {
    state = {
        email: '',
        errors: {},
        isLoading: false,
    }

    submit = (submitEvent) => {
        submitEvent.preventDefault()

        this.setState({
            isLoading: true,
        })

        Tensei.request
            .post('forgot-password', {
                email: this.state.email,
            })
            .then(() => {
                this.setState({
                    isLoading: false,
                })

                Tensei.library.Notification.success(
                    `An email has been sent to the supplied email address. Follow the instruction in the email to reset your password`
                )
                this.props.history.push(Tensei.getPath('auth/login'))
            })
            .catch((error) => {
                if (error?.response?.status === 422) {
                    return this.setState({
                        isLoading: false,
                        errors: this.flattenErrors(error.response.data),
                    })
                }
                Tensei.library.Notification.error(
                    `An error occured while sending password reset email, please try again.`
                )
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
                        <form onSubmit={this.submit} action="">
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

                            <div className="mt-8 flex justify-end items-center">
                                <Button
                                    type="submit"
                                    buttonType="primary"
                                    disabled={this.state.isLoading}
                                    loading={this.state.isLoading}
                                >
                                    Rest Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default mustBeNotAuthenticated(ForgotPasswordPage)
