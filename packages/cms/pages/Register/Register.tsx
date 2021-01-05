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
        password: string
        is_loading: boolean
        remember_me: boolean
        is_login: boolean
    }>({
        name: '',
        email: '',
        errors: {},
        password: '',
        is_loading: false,
        remember_me: false,
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
            .post(state.is_login ? 'login' : 'register', {
                email: state.email,
                password: state.password,
                remember_me: state.remember_me
            })
            .then(() => {
                window.location.href = window.Tensei.getPath('')
            })
            .catch(({ response }) => {
                setState({
                    ...state,
                    is_loading: false,
                    errors: formatErrors(response.data?.error?.errors || [])
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
                <div className="border-t-2 border-tensei-primary bg-white shadow-md py-8 px-8">
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
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            label="Password"
                            className="mt-4"
                            error={state.errors.password}
                            placeholder={
                                state.is_login
                                    ? '********'
                                    : 'Choose a secure password'
                            }
                            value={state.password}
                            onChange={event =>
                                setState({
                                    ...state,
                                    password: event.target.value
                                })
                            }
                        />

                        <div className="mt-8 flex flex-wrap justify-between items-center">
                            <div className="flex items-center w-full md:w-auto">
                                <Checkbox
                                    onChange={event =>
                                        setState({
                                            ...state,
                                            remember_me: event.target.checked
                                        })
                                    }
                                    id="remember_me"
                                    className="mr-3"
                                    name="remember_me"
                                    checked={state.remember_me}
                                />

                                <label
                                    htmlFor="remember_me"
                                    className="inline-block mt-0 md:mt-1"
                                >
                                    Remember me
                                </label>
                            </div>

                            <Button
                                primary
                                type="submit"
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
