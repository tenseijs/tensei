import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from '~/pages/Dashboard'
import setupPage from '~/testSetup/setupPage'
import { resources } from '~/testSetup/data'

describe('Test the dashboard page', () => {
    beforeEach(() => {
        window.Flamingo = {
            getPath: jest.fn(() => 'string'),
        }
    })
    afterEach(cleanup)
    test('should match snapshot', () => {
        const { asFragment } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        expect(asFragment()).toMatchSnapshot()
    })
    test('resources should be listed on the sidebar', () => {
        const { getByText } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        expect(getByText(resources[0].label)).toBeInTheDocument()
    })
    test('resources can be toggled to hide / show', () => {
        const { getByText, queryByText } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        fireEvent.click(getByText('Resources'))

        expect(queryByText(resources[0].label)).not.toBeInTheDocument()
    })
    test('the dashboard header has the appropriate links', () => {
        const { getByTestId, getAllByTestId } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        fireEvent.click(getByTestId('dashboard-header-dropdown'))
        expect(getAllByTestId('dashboard-header-dropdown-list')).toHaveLength(2)
    })
    test('the dashboard header has the appropriate links', () => {
        const { getByTestId, getAllByTestId } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        fireEvent.click(getByTestId('dashboard-header-dropdown'))
        expect(getAllByTestId('dashboard-header-dropdown-list')).toHaveLength(2)
    })
    test('clicking logout on the header dropdown should log user out', () => {
        window.Flamingo = {
            getPath: jest.fn(() => 'auth/login'),
            request: { post: jest.fn(() => Promise.resolve(true)) },
            location: { assign: jest.fn() },
        }
        const { getByTestId, getByText, debug } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        fireEvent.click(getByTestId('dashboard-header-dropdown'))
        fireEvent.click(getByText('Logout'))
    })
    test('can navigate to a resource i.e Post resource', async () => {
        window.Flamingo = {
            getPath: jest.fn(() => '/resources/posts?page=1&perPage=25'),
            request: {
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
            },
        }
        const { getByText, debug } = setupPage(
            ['/', '/resources/posts', '/resources/posts/new', 'auth/login'],
            0,
            Dashboard
        )
        fireEvent.click(await getByText('Posts'))
        // debug()
    })
})
