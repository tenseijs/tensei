import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history'
import { MemoryRouter } from 'react-router-dom'
import Auth from '~/store/auth'
import Resources from '~/store/resources'
import Login from '~/pages/Login'

const history = createMemoryHistory()

const resources = [
    {
        collection: 'posts',
        defaultPerPage: 1,
        displayInNavigation: true,
        fields: [],
        group: 'All',
        label: 'Posts',
        messages: {
            'title.required': 'The title field is required.',
            'publishedAt.required': 'The published at field is required.',
        },
        name: 'Post',
        param: 'posts',
        perPageOptions: (3)[(1, 3, 5)],
        primaryKey: '_id',
    },
]

const user = {
    email: 'dodo@email.com',
    firstName: 'dozie',
    lastName: 'nwoga',
    password: '$2a$10$d.IeGxbRR4kc1ZxE7u0LSuHMrX9aMlUrbLgLoxqEcVI9I2CyntgV.',
    _id: '5f0d62b4e2fab0431e1d35cf',
}

const setupLogin = (
    props = {
        resources,
    }
) =>
    render(
        <MemoryRouter initialIndex={0} initialEntries={['/auth/login']}>
            <Auth.Provider value={[]}>
                <Resources.Provider
                    value={{
                        resources: resources,
                    }}
                >
                    <Login {...props} location={history.location} />
                </Resources.Provider>
            </Auth.Provider>
        </MemoryRouter>
    )

describe('Test the dashboard page', () => {
    test('should match snapshot', () => {
        const { asFragment } = setupLogin()
        window.Flamingo = {
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        expect(asFragment()).toMatchSnapshot()
    })
    test('user can login succesfully', () => {
        window.Flamingo = {
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        const { getByLabelText, getByText } = setupLogin()
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
        const { getByLabelText, getByText } = setupLogin()
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
