import { fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '~/pages/Login'
import setupPage from '~/testSetup/setupPage'

describe('Test the Login page', () => {
    test('should match snapshot', () => {
        const { asFragment } = setupPage(['/auth/login'], 0, Login, false)
        window.Flamingo = {
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        expect(asFragment()).toMatchSnapshot()
    })
    test('user can login succesfully', () => {
        window.Flamingo = {
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        const { getByLabelText, getByText } = setupPage(
            ['/auth/login'],
            0,
            Login,
            false
        )
        const emailField = getByLabelText('Email')
        const passwordField = getByLabelText('password')
        const loginBtn = getByText('Sign in')
        fireEvent.change(emailField, {
            target: {
                value: 'dozie',
            },
        })
        fireEvent.change(passwordField, {
            target: {
                value: 'dozie',
            },
        })
        fireEvent.click(loginBtn)
    })
    test('user shoule get apporpriate error messages', async () => {
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
        const { getByLabelText, getByText } = setupPage(
            ['/auth/login'],
            0,
            Login,
            false
        )
        const emailField = getByLabelText('Email')
        const passwordField = getByLabelText('password')
        const loginBtn = getByText('Sign in')
        fireEvent.change(emailField, {
            target: {
                value: 'dozie@emaill.com',
            },
        })
        fireEvent.change(passwordField, {
            target: {
                value: 'dozie',
            },
        })
        fireEvent.click(loginBtn)
        await waitFor(() => {
            expect(
                getByText(/These credentials do not match our records./i)
            ).toBeInTheDocument()
        })
    })
})
