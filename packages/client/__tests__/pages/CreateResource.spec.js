import React from 'react'
import {
    render,
    fireEvent,
    cleanup,
    getAllByTestId,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history'
import { MemoryRouter } from 'react-router-dom'
import Auth from '~/store/auth'
import Resources from '~/store/resources'
import CreateResource from '~/pages/CreateResource'

const history = createMemoryHistory()

const resources = [
    {
        collection: 'posts',
        defaultPerPage: 1,
        displayInNavigation: true,
        fields: [],
        group: 'All',
        label: 'Posts',
        slug: 'posts',
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

const setupCreateResource = (
    props = {
        resources,
    }
) =>
    render(
        <MemoryRouter
            initialIndex={0}
            initialEntries={['/resources/posts/new']}
        >
            <Auth.Provider value={[user, () => jest.fn()]}>
                <Resources.Provider
                    value={{
                        resources: resources,
                    }}
                >
                    <CreateResource {...props} location={history.location} />
                </Resources.Provider>
            </Auth.Provider>
        </MemoryRouter>
    )

describe('Test the dashboard page', () => {
    beforeEach(() => {
        window.Flamingo = {
            getPath: jest.fn(() => 'string'),
        }
    })
    afterEach(cleanup)
    test('create resource page should match snapshot', () => {
        const { asFragment } = setupCreateResource()
        expect(asFragment()).toMatchSnapshot()
    })
})
