import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Auth from '~/store/auth'
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

const WithAuthComponent = (props) => (
    <Router history={history}>
        <Auth.Provider
            value={{
                authorizedToCreate: jest.fn(() => Promise.resolve(true)),
                authorizedToUpdate: jest.fn(() => Promise.resolve(true)),
                authorizedToDelete: jest.fn(() => Promise.resolve(true)),
            }}
        >
            <ResourceIndex {...props} />
        </Auth.Provider>
    </Router>
)

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
        const { asFragment } = render(<WithAuthComponent {...props} />)
        expect(asFragment()).toMatchSnapshot()
    })
    test('resource index page rerenders with apporpriate props when the params changes', async () => {
        const props = {
            match,
            resources,
            history: { push: jest.fn() },
            location: { pathname: 'resource/posts' },
        }
        const { rerender } = render(<WithAuthComponent {...props} />)

        expect(screen.getByText('Posts')).toBeInTheDocument()

        const newProps = {
            ...props,
            match: { params: { resource: 'news' } },
        }

        rerender(<WithAuthComponent {...newProps} />)

        expect(screen.queryByText('Posts')).not.toBeInTheDocument()
        expect(screen.getByText('News')).toBeInTheDocument()
    })
    // test('can search for values on the resource table', async () => {
    //     render(<WithAuthComponent {...props} />)
    //     await waitFor(() =>
    //         expect(screen.queryAllByTestId('table-row')).toHaveLength(2)
    //     )
    //     const searchInput = screen.getByPlaceholderText(
    //         /Type to search for posts/i
    //     )
    //     fireEvent.change(searchInput, {
    //         target: { value: 'Amapai' },
    //     })
    //     window.Flamingo = {
    //         ...FlamingoMock,
    //         request: {
    //             get: jest.fn().mockResolvedValue({
    //                 data: {
    //                     data: [
    //                         {
    //                             av_cpc: 21,
    //                             category: 'angular',
    //                             content: 'this is the content for amapai',
    //                             created_at: '2020-08-12T21:40:24.000Z',
    //                             description:
    //                                 'this is the description for amapai',
    //                             id: 1,
    //                             published_at: '2020-08-11T23:00:00.000Z',
    //                             scheduled_for: '2020-08-11T23:00:00.000Z',
    //                             title: 'Amapai',
    //                             updated_at: '2020-08-12T21:40:24.000Z',
    //                             user_id: 2,
    //                         },
    //                     ],
    //                     page: 1,
    //                     total: 1,
    //                     perPage: 10,
    //                     pageCount: 1,
    //                 },
    //             }),
    //         },
    //     }
    //     await waitFor(() =>
    //         expect(screen.queryAllByTestId('table-row')).toHaveLength(1)
    //     )
    //     expect(window.Flamingo.request.get).toHaveBeenCalled()
    //     expect(window.Flamingo.request.get).toHaveBeenCalledWith(
    //         'resources/posts?per_page=10&page=1&search=Amapai&fields=name,description,content'
    //     )
    // })
    // test.only('clicking on the delete icon should delete that specific row data', async () => {
    //     render(<WithAuthComponent {...props} />)

    //     screen.debug(screen.queryAllByTestId('d'))
    //     // fireEvent.click(screen.queryAllByTestId('delete-icon')[0])
    // })
    // test('clicking on the filter button should open the filter dropdown', async () => {
    //     render(<WithAuthComponent {...props} />)
    //     expect(screen.queryByTestId('filter-box')).toBeFalsy()

    //     fireEvent.click(screen.queryByTestId('filter-button'))

    //     expect(screen.queryByTestId('filter-box')).toBeTruthy()

    //     fireEvent.change(screen.getByTestId('select-filter-column'), {
    //         target: { value: 1 },
    //     })
    //     let options = screen.getAllByTestId('filter-column-option')

    //     expect(options[0].selected).toBeTruthy()
    //     expect(options[1].selected).toBeFalsy()
    // })
    // test('The ResourceIndex page shows only fields with showOnIndex', async () => {
    //     render(
    //         <Router history={history}>
    //             <ResourceIndex {...props} />
    //         </Router>
    //     )
    //     expect(screen.getByText(/name/i)).toBeInTheDocument()
    //     expect(screen.getByText(/description/i)).toBeInTheDocument()
    //     expect(screen.getByText(/content/i)).toBeInTheDocument()

    //     expect(screen.queryByText(/visuals/i)).not.toBeInTheDocument()
    // })
    // test('The select checkbox should check a row', async () => {
    //     render(
    //         <Router history={history}>
    //             <ResourceIndex {...props} />
    //         </Router>
    //     )
    //     const [checkBox1] = await waitFor(() =>
    //         screen.getAllByTestId('row-checkbox')
    //     )
    //     expect(checkBox1).not.toBeChecked()
    //     fireEvent.click(checkBox1)
    //     expect(checkBox1).toBeChecked()
    // })
    // test('The select all checkbox should check all the resources on the page', async () => {
    //     render(
    //         <Router history={history}>
    //             <ResourceIndex {...props} />
    //         </Router>
    //     )
    //     const selectAllCheckBox = await waitFor(() =>
    //         screen.getByTestId('selectall-checkbox')
    //     )
    //     const checkBoxes = await waitFor(() =>
    //         screen.getAllByTestId('row-checkbox')
    //     )
    //     checkBoxes.map((checkbox) => {
    //         expect(checkbox).not.toBeChecked()
    //     })
    //     fireEvent.click(selectAllCheckBox)
    //     checkBoxes.map((checkbox) => {
    //         expect(checkbox).toBeChecked()
    //     })
    // })
    // test('Clicking the Add X button redirects correctly to the creation page', () => {})
})
