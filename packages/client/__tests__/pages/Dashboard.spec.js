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
import Dashboard from '~/pages/Dashboard'

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

const setupDashboard = (
    props = {
        resources,
    }
) =>
    render(
        <MemoryRouter
            initialIndex={0}
            initialEntries={[
                '/',
                '/resources/posts',
                '/resources/posts/new',
                'auth/login',
            ]}
        >
            <Auth.Provider value={[user, () => jest.fn()]}>
                <Resources.Provider
                    value={{
                        resources: resources,
                    }}
                >
                    <Dashboard {...props} location={history.location} />
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
    test('should match snapshot', () => {
        const { asFragment } = setupDashboard()
        expect(asFragment()).toMatchSnapshot()
    })
    test('resources should be listed on the sidebar', () => {
        const { getByText } = setupDashboard()
        expect(getByText(resources[0].label)).toBeInTheDocument()
    })
    test('resources can be toggled to hide / show', () => {
        const { getByText, queryByText } = setupDashboard()
        fireEvent.click(getByText('Resources'))

        expect(queryByText(resources[0].label)).not.toBeInTheDocument()
    })
    test('the dashboard header has the appropriate links', () => {
        const { getByTestId, getAllByTestId } = setupDashboard()
        fireEvent.click(getByTestId('dashboard-header-dropdown'))
        expect(getAllByTestId('dashboard-header-dropdown-list')).toHaveLength(2)
    })
    test('the dashboard header has the appropriate links', () => {
        const { getByTestId, getAllByTestId } = setupDashboard()
        fireEvent.click(getByTestId('dashboard-header-dropdown'))
        expect(getAllByTestId('dashboard-header-dropdown-list')).toHaveLength(2)
    })
    test('clicking logout on the header dropdown should log user out', () => {
        window.Flamingo = {
            getPath: jest.fn(() => 'auth/login'),
            request: { post: jest.fn(() => Promise.resolve(true)) },
            location: { assign: jest.fn() },
        }
        const { getByTestId, getByText, debug } = setupDashboard()
        fireEvent.click(getByTestId('dashboard-header-dropdown'))
        fireEvent.click(getByText('Logout'))
    })
    test('can navigate to a resource i.e Post resource', async () => {
        window.Flamingo = {
            getPath: jest.fn(() => '/resources/posts?page=1&perPage=25'),
            get: jest.fn().mockResolvedValue({
                response: {
                    status: 200,
                    data: {
                        data: 'posts',
                        page: 1,
                        total: 2,
                        perPage: 5,
                        pageCount: 1,
                    },
                },
            }),
        }
        const { getByText, debug } = setupDashboard()
        fireEvent.click(await getByText('Posts'))
        debug()
    })
})
