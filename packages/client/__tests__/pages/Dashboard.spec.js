import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history'
import { MemoryRouter } from 'react-router-dom'

import Auth from '~/store/auth'
import Resources from '~/store/resources'
import Dashboard from '~/pages/Dashboard'
import { resources, user } from '~/testSetup/data'

const history = createMemoryHistory()

console.error = jest.fn()

const DashBoardSetup = () => {
    const props = { resources }
    return (
        <MemoryRouter
            initialIndex={0}
            initialEntries={[
                '/resources/posts',
                '/resources/posts/new',
                'auth/login',
            ]}
        >
            <Auth.Provider
                value={{
                    user,
                    authorizedToCreate: jest.fn(() => true),
                    authorizedToUpdate: jest.fn(() => true),
                    authorizedToDelete: jest.fn(() => true),
                }}
            >
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
}

describe('Test the dashboard page', () => {
    beforeEach(() => {
        window.Tensei = {
            getPath: jest.fn(() => 'string'),
        }
    })

    afterEach(cleanup)

    test('should match snapshot', () => {
        const { asFragment } = render(<DashBoardSetup />)

        expect(asFragment()).toMatchSnapshot()
    })

    test('resources should be listed on the sidebar', () => {
        render(<DashBoardSetup />)

        resources.map((r) => {
            expect(screen.getByText(r.label)).toBeInTheDocument()
        })
    })

    test('resources can be toggled to hide / show', () => {
        render(<DashBoardSetup />)

        resources.map((r) => {
            expect(screen.getByText(r.label)).toBeInTheDocument()
        })

        userEvent.click(screen.getByText('Resources'))

        resources.map((r) => {
            expect(screen.queryByText(r.label)).not.toBeInTheDocument()
        })
    })

    test('the dashboard header has the appropriate links', () => {
        render(<DashBoardSetup />)

        userEvent.click(screen.getByTestId('dashboard-header-dropdown'))

        expect(
            screen.getAllByTestId('dashboard-header-dropdown-list')
        ).toHaveLength(2)
        expect(screen.getByText(/Account settings/i)).toBeInTheDocument()
        expect(screen.getByText(/Logout/i)).toBeInTheDocument()

        userEvent.click(screen.getByTestId('dashboard-header-dropdown'))

        expect(screen.queryByText(/Account settings/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument()
    })

    test('clicking logout on the header dropdown should log user out', () => {
        window.Tensei = {
            getPath: jest.fn(() => 'auth/login'),
            request: { post: jest.fn(() => Promise.resolve(true)) },
            location: { assign: jest.fn() },
        }

        render(<DashBoardSetup />)

        userEvent.click(screen.getByTestId('dashboard-header-dropdown'))
        userEvent.click(screen.getByText(/Logout/i))

        expect(window.Tensei.request.post).toHaveBeenCalledWith('logout')
    })
})
