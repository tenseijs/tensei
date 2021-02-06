import React, { useState, FormEventHandler } from 'react'
import { TextInput, Checkbox, Button } from '@tensei/components'
import { useHistory, useLocation, Redirect } from 'react-router-dom'

const Register = () => {
    const { push } = useHistory()
    const location = useLocation()
    const [state, setState] = useState<{
        name: string
        email: string
        errors: {
            [key: string]: string
        }
        is_loading: boolean
        is_login: boolean
        submitted?: boolean
    }>({
        name: '',
        email: '',
        errors: {},
        submitted: false,
        is_loading: false,
        is_login: !!location.pathname.match('login')
    })

    const formatErrors = (errors: any[] = []) => {
        let errorsMap: any = {}

        errors.forEach(error => {
            errorsMap[error.field] = error.message
        })

        return errorsMap
    }

    const onSubmit: FormEventHandler<HTMLFormElement> = event => {
        setState({
            ...state,
            errors: {},
            is_loading: true
        })

        event.preventDefault()

        window.Tensei.client
            .post(
                `passwordless/email/${state.is_login ? 'login' : 'register'}`,
                {
                    email: state.email
                }
            )
            .then(() => {
                window.Tensei.success(
                    'Please check your email for a magic link to log you in.',
                    {
                        duration: null
                    }
                )

                setState({
                    ...state,
                    is_loading: false,
                    submitted: true,
                    errors: {}
                })
            })
            .catch(({ response }) => {
                setState({
                    ...state,
                    is_loading: false,
                    errors: formatErrors(
                        Array.isArray(response.data)
                            ? response.data
                            : response.data?.error?.errors || []
                    )
                })
            })
    }

    if (state.is_login && !window.Tensei.state.registered) {
        return <Redirect to={window.Tensei.getPath('auth/register')} />
    }

    return (
        <div className="w-full bg-gray-100 h-screen">
            <div className="max-w-md mx-auto pt-20 md:px-0 px-5">
                <div className="flex justify-center mb-5">
                    <img
                        className="h-10"
                        alt="tensei-logo"
                        src="https://res.cloudinary.com/bahdcoder/image/upload/v1604236130/Asset_1_4x_fhcfyg.png"
                    />
                </div>
                <div className="border-t-2 border-tensei-primary bg-white shadow-md pt-4 pb-6 px-8">
                    <form onSubmit={onSubmit}>
                        <TextInput
                            id="email"
                            name="email"
                            label="Email"
                            className="mt-4"
                            value={state.email}
                            placeholder="john@doe.com"
                            error={state.errors.email}
                            onChange={event =>
                                setState({
                                    ...state,
                                    email: event.target.value
                                })
                            }
                        />
                        <div className="flex flex-wrap justify-end items-center mt-2">
                            <Button
                                primary
                                type="submit"
                                disabled={state.submitted}
                                loading={state.is_loading}
                                className="mt-3 md:mt-3 text-center"
                            >
                                {state.is_login ? 'Login' : 'Create admin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
