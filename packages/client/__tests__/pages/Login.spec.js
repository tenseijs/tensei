import React from 'react'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history'
import { MemoryRouter } from 'react-router-dom'

import Auth from '~/store/auth'
import Resources from '~/store/resources'
import Login from '~/pages/Login'

const history = createMemoryHistory()

const LoginSetup = (props) => {
    return (
        <MemoryRouter initialIndex={0} initialEntries={['/auth/login']}>
            <Auth.Provider value={{}}>
                <Resources.Provider
                    value={{
                        resources: [],
                    }}
                >
                    <Login {...props} location={history.location} />
                </Resources.Provider>
            </Auth.Provider>
        </MemoryRouter>
    )
}

describe('Test the Login page', () => {
    beforeEach(() => {
        window.Flamingo = {
            request: {
                post: jest.fn().mockRejectedValue({
                    response: {
                        status: 422,
                        data: {
                            errors: [
                                {
                                    message:
                                        'These credentials do not match our records.',
                                    field: 'email',
                                },
                            ],
                        },
                    },
                }),
            },
        }
    })
    test('should match snapshot', () => {
        window.Flamingo = {
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        const { asFragment } = render(<LoginSetup />)

        expect(asFragment()).toMatchSnapshot()
    })
    test('user can login succesfully', () => {
        render(<LoginSetup />)

        const emailField = screen.getByLabelText('Email')
        const passwordField = screen.getByLabelText('password')
        const loginBtn = screen.getByText('Sign in')

        userEvent.type(emailField, 'dozie@gmail.com')
        userEvent.type(passwordField, 'secret')
        userEvent.click(loginBtn)

        expect(window.Flamingo.request.post).toHaveBeenCalled()
    })
    test('user shoule get apporpriate error messages', async () => {
        render(<LoginSetup />)

        const emailField = screen.getByLabelText('Email')
        const passwordField = screen.getByLabelText('password')
        const loginBtn = screen.getByText('Sign in')

        userEvent.type(emailField, 'dozie@emaill.com')
        userEvent.type(passwordField, 'dozie')
        userEvent.click(loginBtn)

        expect(
            await screen.findByText(
                /These credentials do not match our records./i
            )
        ).toBeInTheDocument()
    })
})
