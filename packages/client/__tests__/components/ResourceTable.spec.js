import React from 'react'
import {
    render,
    screen,
    waitFor,
    fireEvent,
    within,
} from '@testing-library/react'
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
                authorizedToCreate: jest.fn(() => true),
                authorizedToUpdate: jest.fn(() => true),
                authorizedToDelete: jest.fn(() => true),
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
        name: fake((f) => f.lorem.word),
        user_id: fake((f) => f.random.number()),
    },
})

const tableData = [
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
]

describe('ResourceTable tests', () => {
    beforeEach(() => {
        window.Flamingo = {
            ...FlamingoMock,
            request: {
                get: jest.fn().mockResolvedValue({
                    data: {
                        data: tableData,
                        page: 1,
                        total: 29,
                        perPage: 25,
                        pageCount: 2,
                    },
                }),
                delete: jest.fn(() => Promise.resolve(true)),
            },
        }
    })
    afterEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })
    test.only('can search for values on the resource table', async () => {
        render(<WithAuthComponent {...props} />)
        await waitFor(() =>
            expect(screen.queryAllByRole('row')).toHaveLength(30)
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
            expect(screen.queryAllByRole('row')).toHaveLength(2)
        )
        expect(window.Flamingo.request.get).toHaveBeenCalled()
        expect(window.Flamingo.request.get).toHaveBeenCalledWith(
            'resources/posts?per_page=25&page=1&search=Amapai&fields=name,description,content'
        )
    })
    test.only('clicking the pagination should fetch new values', async () => {
        render(<WithAuthComponent {...props} />)

        const ul = await screen.findByRole('list')

        const [, page1Btn, page2Btn] = await within(ul).findAllByRole('button')

        expect(page1Btn).toHaveAttribute('aria-current', 'page')
        expect(page2Btn).not.toHaveAttribute('aria-current', 'page')

        userEvent.click(page2Btn)

        expect(page2Btn).toHaveAttribute('aria-current', 'page')
    })
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
            screen.getAllByRole('checkbox', { name: 'Select row' })
        )
        expect(checkBox1).not.toBeChecked()
        fireEvent.click(checkBox1)
        expect(checkBox1).toBeChecked()
    })
    test.only('The select all checkbox should check all the resources on the page', async () => {
        render(<WithAuthComponent {...props} />)

        const selectAllCheckBox = await screen.findByRole('checkbox', {
            name: `Select all ${props.resource.label}`,
        })

        const checkBoxes = await screen.findAllByRole('checkbox', {
            name: 'Select row',
        })

        checkBoxes.map((checkbox) => {
            expect(checkbox).not.toBeChecked()
        })

        userEvent.click(selectAllCheckBox)
        checkBoxes.map((checkbox) => {
            expect(checkbox).toBeChecked()
        })
    })
    test.only('clicking the table row navigates to the details page', async () => {
        render(<WithAuthComponent {...props} />)
        const tableRows = await screen.findAllByTestId('table-row')
        userEvent.click(tableRows[1])

        // to do, findout why the props.history.push is not getting called in the test
        // expect(props.history.push).toHaveBeenCalledWith(`resources/mane`)
    })
    test.only('can delete a resource', async () => {
        render(<WithAuthComponent {...props} />)

        const allDeleteBtn = await screen.findAllByTestId('delete-resource-btn')

        await waitFor(() => expect(allDeleteBtn).toHaveLength(29))
        const [deleteBtn] = await screen.findAllByTestId('delete-resource-btn')

        userEvent.click(deleteBtn)

        const deleteModal = await screen.findByRole('dialog')

        await waitFor(async () => expect(deleteModal).toBeInTheDocument())

        const modalDeletBtn = await within(deleteModal).findByText('Delete')

        userEvent.click(modalDeletBtn)
        await waitFor(() =>
            expect(window.Flamingo.request.delete).toHaveBeenCalledWith(
                `resources/${props.resource.slug}/${tableData[0].id}`
            )
        )
    })
})
