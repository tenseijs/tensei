import React from 'react'
import { mustBeNotAuthenticated } from '~/store/auth'
import { TextField, Button } from '@contentful/forma-36-react-components'

class ResetPasswordPage extends React.Component {
    state = {
        password: '',
        errors: {},
        isLoading: false,
        token: '',
    }

    submit = (submitEvent) => {
        submitEvent.preventDefault()

        this.setState({
            isLoading: true,
        })

        Tensei.request
            .post('reset-password', {
                password: this.state.password,
                token: this.props.match.params.token,
            })
            .then(() => {
                this.setState({ isLoading: false })

                Tensei.library.Notification.success(
                    'Your password has been reset, login in again'
                )

                this.props.history.push(Tensei.getPath('auth/login'))
            })
            .catch((error) => {
                this.setState({ isLoading: false })
                if (error?.response?.status === 422) {
                    this.setState({
                        isLoading: false,
                        errors: this.flattenErrors(error.response.data.errors),
                    })
                }
                if (error?.response?.status === 401) {
                    Tensei.library.Notification.error(
                        error.response.data[0].message ||
                            'The reset token has expired'
                    )
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
                        <form onSubmit={this.submit} action="">
                            <TextField
                                labelText="New Password"
                                name="password"
                                id="password"
                                textInputProps={{
                                    type: 'password',
                                }}
                                value={this.state.password}
                                placeholder=""
                                validationMessage={this.state.errors.password}
                                onChange={(event) =>
                                    this.setState({
                                        password: event.target.value,
                                    })
                                }
                            />

                            <div className="mt-8 flex justify-end items-center">
                                <Button
                                    type="submit"
                                    buttonType="primary"
                                    disabled={this.state.isLoading}
                                    loading={this.state.isLoading}
                                >
                                    Set New Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default mustBeNotAuthenticated(ResetPasswordPage)
