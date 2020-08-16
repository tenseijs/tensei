import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { resources } from '~/testSetup/data'
import FlamingoMock from '~/testSetup/Flamingo'
import ResourceIndex from '~/pages/ResourceIndex'

const history = createMemoryHistory({ initialEntries: ['/resources/posts'] })
const match = { params: { resource: 'posts' } }
const props = {
    match,
    resources,
    history: { push: jest.fn() },
    location: { pathname: 'resource/posts' },
}

describe('Test the resource index page', () => {
    beforeEach(() => {
        window.Flamingo = {
            ...FlamingoMock,
            request: {
                get: jest.fn().mockResolvedValue({
                    data: {
                        data: [
                            {
                                av_cpc: 23,
                                category: 'angular',
                                content: 'this is the content for magnus',
                                created_at: '2020-08-12T21:40:24.000Z',
                                description:
                                    'this is the description for magnus',
                                id: 1,
                                published_at: '2020-08-11T23:00:00.000Z',
                                scheduled_for: '2020-08-11T23:00:00.000Z',
                                title: 'Magnus',
                                updated_at: '2020-08-12T21:40:24.000Z',
                                user_id: 2,
                            },
                            {
                                av_cpc: 21,
                                category: 'angular',
                                content: 'this is the content for amapai',
                                created_at: '2020-08-12T21:40:24.000Z',
                                description:
                                    'this is the description for amapai',
                                id: 2,
                                published_at: '2020-08-11T23:00:00.000Z',
                                scheduled_for: '2020-08-11T23:00:00.000Z',
                                title: 'Amapai',
                                updated_at: '2020-08-12T21:40:24.000Z',
                                user_id: 2,
                            },
                        ],
                        page: 1,
                        total: 2,
                        perPage: 10,
                        pageCount: 1,
                    },
                }),
            },
        }
    })
    test('resource index page should match snapshot', () => {
        const { asFragment } = render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        expect(asFragment()).toMatchSnapshot()
    })
    test('should load posts data and display on table', () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        expect(window.Flamingo.request.get).toHaveBeenCalled()
    })
    test('per page button changes the pers page value for the table', () => {})
    test('can select a row on the resource table', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        await waitFor(() =>
            fireEvent.click(screen.getAllByTestId('table-row')[0])
        )
    })
    test('can search for values on the resource table', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        await waitFor(() =>
            expect(screen.queryAllByTestId('table-row')).toHaveLength(2)
        )
        fireEvent.change(screen.getByTestId('search-resource'), {
            target: { value: 'Amapai' },
        })
        window.Flamingo = {
            ...FlamingoMock,
            request: {
                get: jest.fn().mockResolvedValue({
                    data: {
                        data: [
                            {
                                av_cpc: 21,
                                category: 'angular',
                                content: 'this is the content for amapai',
                                created_at: '2020-08-12T21:40:24.000Z',
                                description:
                                    'this is the description for amapai',
                                id: 1,
                                published_at: '2020-08-11T23:00:00.000Z',
                                scheduled_for: '2020-08-11T23:00:00.000Z',
                                title: 'Amapai',
                                updated_at: '2020-08-12T21:40:24.000Z',
                                user_id: 2,
                            },
                        ],
                        page: 1,
                        total: 1,
                        perPage: 10,
                        pageCount: 1,
                    },
                }),
            },
        }
        await waitFor(() =>
            expect(screen.queryAllByTestId('table-row')).toHaveLength(1)
        )
    })
    test('table row should show correct amount of data', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        await waitFor(() =>
            expect(screen.queryAllByTestId('table-row')).toHaveLength(2)
        )
    })
    test('clicking on the delete icon should delete that specific row data', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        await waitFor(() =>
            fireEvent.click(screen.getAllByTestId('delete-icon')[0])
        )
    })
    test('clicking on the filter button should open the filter dropdown', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        expect(screen.queryByTestId('filter-box')).toBeFalsy()
        fireEvent.click(screen.queryByTestId('filter-button'))
        expect(screen.queryByTestId('filter-box')).toBeTruthy()
        fireEvent.change(screen.getByTestId('select-filter-column'), {
            target: { value: 1 },
        })
        let options = screen.getAllByTestId('filter-column-option')
        expect(options[0].selected).toBeTruthy()
        expect(options[1].selected).toBeFalsy()
    })
})
