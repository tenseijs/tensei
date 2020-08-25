import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { build, fake } from '@jackfranklin/test-data-bot'

import Auth from '~/store/auth'
import { resources } from '~/testSetup/data'
import FlamingoMock from '~/testSetup/Flamingo'
import ResourceTable from '~/components/ResourceTable'

const history = createMemoryHistory({ initialEntries: ['/resources/posts'] })
const match = { params: { resource: 'posts' } }
const props = {
    match,
    resource: resources[0],
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
            <ResourceTable {...props} />
        </Auth.Provider>
    </Router>
)

const tableDataBuilder = build('TableData', {
    fields: {
        id: fake((f) => f.random.number()),
        av_cpc: fake((f) => f.random.number()),
        category: fake((f) => f.lorem.word),
        content: fake((f) => f.lorem.sentence),
        created_at: fake((f) => f.date.future()),
        published_at: fake((f) => f.date.future()),
        scheduled_for: fake((f) => f.date.future()),
        updated_at: fake((f) => f.date.future()),
        description: fake((f) => f.lorem.words(12)),
        title: fake((f) => f.lorem.word),
        user_id: fake((f) => f.random.number()),
    },
})

describe('ResourceTable tests', () => {
    beforeEach(() => {
        window.Flamingo = {
            ...FlamingoMock,
            request: {
                get: jest.fn().mockResolvedValue({
                    data: {
                        data: [
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                            tableDataBuilder(),
                        ],
                        page: 1,
                        total: 29,
                        perPage: 25,
                        pageCount: 2,
                    },
                }),
            },
        }
    })
    test('', () => {})
    test('', () => {})
    test.only('can search for values on the resource table', async () => {
        render(<WithAuthComponent {...props} />)
        await waitFor(() =>
            expect(screen.queryAllByTestId('table-row')).toHaveLength(29)
        )
        const searchInput = screen.getByPlaceholderText(
            /Type to search for posts/i
        )
        fireEvent.change(searchInput, {
            target: { value: 'Amapai' },
        })
        window.Flamingo = {
            ...FlamingoMock,
            request: {
                get: jest.fn().mockResolvedValue({
                    data: {
                        data: [tableDataBuilder()],
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
        expect(window.Flamingo.request.get).toHaveBeenCalled()
        expect(window.Flamingo.request.get).toHaveBeenCalledWith(
            'resources/posts?per_page=10&page=1&search=Amapai&fields=name,description,content'
        )
    })
    test.only('clicking the pagination should fetch new values', async () => {
        render(<WithAuthComponent {...props} />)

        // const page1Btn = await screen.findByRole('button', { name: /Page 1/ })
        const page2Btn = await screen.findByRole('button', { name: /Page 2/ })

        // expect(page1Btn).toHaveAttribute('aria-current', 'page')
        expect(page2Btn).not.toHaveAttribute('aria-current', 'page')

        userEvent.click(page2Btn)

        expect(page2Btn).toHaveAttribute('aria-current', 'page')
    })
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
    test('The ResourceIndex page shows only fields with showOnIndex', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        expect(screen.getByText(/name/i)).toBeInTheDocument()
        expect(screen.getByText(/description/i)).toBeInTheDocument()
        expect(screen.getByText(/content/i)).toBeInTheDocument()

        expect(screen.queryByText(/visuals/i)).not.toBeInTheDocument()
    })
    test.only('The select checkbox should check a row', async () => {
        render(<WithAuthComponent {...props} />)
        const [checkBox1] = await waitFor(() =>
            screen.getAllByTestId('row-checkbox')
        )
        expect(checkBox1).not.toBeChecked()
        fireEvent.click(checkBox1)
        expect(checkBox1).toBeChecked()
    })
    test('The select all checkbox should check all the resources on the page', async () => {
        render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        const selectAllCheckBox = await waitFor(() =>
            screen.getByTestId('selectall-checkbox')
        )
        const checkBoxes = await waitFor(() =>
            screen.getAllByTestId('row-checkbox')
        )
        checkBoxes.map((checkbox) => {
            expect(checkbox).not.toBeChecked()
        })
        fireEvent.click(selectAllCheckBox)
        checkBoxes.map((checkbox) => {
            expect(checkbox).toBeChecked()
        })
    })
})
