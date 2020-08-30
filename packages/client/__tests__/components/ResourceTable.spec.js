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
import TenseiMock from '~/testSetup/Tensei'
import ResourceTable from '~/components/ResourceTable'

const history = createMemoryHistory({ initialEntries: ['/resources/posts'] })
const match = { params: { resource: 'posts' } }
let props = {
    defaultProps: {
        match,
        resource: resources[0],
        history: { push: jest.fn() },
        location: { pathname: 'resource/posts' },
    },
    permissions: {
        authorizedToCreate: jest.fn(() => true),
        authorizedToUpdate: jest.fn(() => true),
        authorizedToDelete: jest.fn(() => true),
        authorizedToRunAction: jest.fn(() => true),
        authorizedToSee: jest.fn(() => true),
    },
}

const WithAuthComponent = (props) => (
    <Router history={history}>
        <Auth.Provider value={props.permissions}>
            <ResourceTable {...props.defaultProps} />
        </Auth.Provider>
    </Router>
)

const tableDataBuilder = build('TableData', {
    fields: {
        id: fake((f) => f.random.number()),
        av_cpc: fake((f) => f.random.number()),
        category: fake((f) => f.lorem.word()),
        content: fake((f) => f.lorem.sentence()),
        created_at: fake((f) => f.date.future()),
        published_at: fake((f) => f.date.future()),
        scheduled_for: fake((f) => f.date.future()),
        updated_at: fake((f) => f.date.future()),
        description: fake((f) => f.lorem.words(12)),
        name: fake((f) => f.lorem.word()),
        user_id: fake((f) => f.random.number()),
    },
})

const tableData = Array.from({ length: 50 }).map(() => tableDataBuilder())

describe('ResourceTable tests', () => {
    beforeEach(() => {
        window.Tensei = {
            ...TenseiMock,
            request: {
                get: jest.fn().mockResolvedValueOnce({
                    data: {
                        data: tableData,
                        page: 1,
                        total: 50,
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
    })
    test('can search for values on the resource table', async () => {
        render(<WithAuthComponent {...props} />)

        await waitFor(
            () => expect(screen.queryAllByRole('row')).toHaveLength(51) // add one for the header row
        )

        const searchInput = screen.getByPlaceholderText(
            /Type to search for posts/i
        )

        fireEvent.change(searchInput, {
            target: { value: 'Amapai' },
        })

        window.Tensei.request.get = jest.fn().mockResolvedValueOnce({
            data: {
                data: [tableDataBuilder()],
                page: 1,
                total: 1,
                perPage: 10,
                pageCount: 1,
            },
        })

        await waitFor(() =>
            expect(screen.queryAllByRole('row')).toHaveLength(2)
        )

        expect(window.Tensei.request.get).toHaveBeenCalled()
        expect(window.Tensei.request.get).toHaveBeenCalledWith(
            'resources/posts?per_page=25&page=1&search=Amapai&fields=name,description,content'
        )
    })

    test('clicking the pagination should fetch new values', async () => {
        render(<WithAuthComponent {...props} />)

        const ul = await screen.findByRole('list')

        const [, page1Btn, page2Btn] = await within(ul).findAllByRole('button')

        expect(page1Btn).toHaveAttribute('aria-current', 'page')
        expect(page2Btn).not.toHaveAttribute('aria-current', 'page')

        window.Tensei.request.get = jest.fn().mockResolvedValueOnce({
            data: {
                data: tableData,
                page: 2,
                total: 50,
                perPage: 10,
                pageCount: 2,
            },
        })

        userEvent.click(page2Btn)

        expect(page2Btn).toHaveAttribute('aria-current', 'page')
    })

    test.skip('The ResourceIndex page shows only fields with showOnIndex', async () => {
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

    test('The select checkbox should check a row', async () => {
        render(<WithAuthComponent {...props} />)

        const [checkBox1] = await waitFor(() =>
            screen.getAllByRole('checkbox', { name: 'Select row' })
        )

        expect(checkBox1).not.toBeChecked()

        fireEvent.click(checkBox1)

        expect(checkBox1).toBeChecked()
    })

    test('The select all checkbox should check all the resources on the page', async () => {
        render(<WithAuthComponent {...props} />)

        const selectAllCheckBox = await screen.findByRole('checkbox', {
            name: `Select all ${props.defaultProps.resource.label}`,
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

    test('clicking the table row navigates to the details page', async () => {
        render(<WithAuthComponent {...props} />)

        const tableRows = await screen.findAllByTestId('table-row')
        userEvent.click(tableRows[1])

        // to do, findout why the props.history.push is not getting called in the test
        // expect(props.history.push).toHaveBeenCalledWith(`resources/mane`)
    })

    test('can delete a resource', async () => {
        render(<WithAuthComponent {...props} />)

        const allDeleteBtn = await screen.findAllByTestId('delete-resource-btn')

        await waitFor(() => expect(allDeleteBtn).toHaveLength(50))
        const [deleteBtn] = await screen.findAllByTestId('delete-resource-btn')

        userEvent.click(deleteBtn)

        const deleteModal = await screen.findByRole('dialog')

        await waitFor(async () => expect(deleteModal).toBeInTheDocument())

        const modalDeletBtn = await within(deleteModal).findByText('Delete')

        window.Tensei.request.get = jest.fn().mockResolvedValueOnce({})

        userEvent.click(modalDeletBtn)

        await waitFor(() =>
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        )
        await waitFor(() =>
            expect(window.Tensei.request.delete).toHaveBeenCalledWith(
                `resources/${props.defaultProps.resource.slug}/${tableData[0].id}`
            )
        )
    })

    test('Hides add button if not authorizedToCreate', () => {
        props = {
            ...props,
            permissions: {
                ...props.permissions,
                authorizedToCreate: jest.fn(() => false),
            },
        }

        render(<WithAuthComponent {...props} />)

        expect(
            screen.queryByText(`Add ${props.defaultProps.resource.name}`)
        ).not.toBeInTheDocument()
    })

    test('Hides delete button if not authorizedToDelete', () => {
        props = {
            ...props,
            permissions: {
                ...props.permissions,
                authorizedToDelete: jest.fn(() => false),
            },
        }
        render(<WithAuthComponent {...props} />)
        expect(screen.queryAllByTestId('delete-resource-btn')).toHaveLength(0)
    })

    test('Hides pencil button if not authorizedToUpdate', () => {
        props = {
            ...props,
            permissions: {
                ...props.permissions,
                authorizedToUpdate: jest.fn(() => false),
            },
        }
        render(<WithAuthComponent {...props} />)
        expect(screen.queryAllByTestId('edit-resource-btn')).toHaveLength(0)
    })

    test('Shows the correct resource label.', () => {
        render(<WithAuthComponent {...props} />)

        expect(
            screen.getByText(props.defaultProps.resource.label)
        ).toBeInTheDocument()
    })

    test.skip('Typing in the search box should call the API endpoint with the correct search parameter', () => {})

    test('Flashes an error if calling fetch fails', async () => {
        window.Tensei = {
            ...TenseiMock,
            request: {
                get: jest
                    .fn()
                    .mockImplementation(() => Promise.reject('value')),
            },
        }

        render(<WithAuthComponent {...props} />)

        await waitFor(() =>
            expect(window.Tensei.library.Notification.error).toHaveBeenCalled()
        )
    })

    test('Pushes parameters to url such as page, per_page', () => {})

    test('Can select different per page based on resource', async () => {
        console.error = jest.fn()
        render(<WithAuthComponent {...props} />)

        const perPageBox = screen.getByRole('combobox', { name: 'per-page' })

        props.defaultProps.resource.perPageOptions.forEach((i) => {
            expect(
                within(perPageBox).getAllByRole('option', {
                    name: `${i} / page`,
                })
            )
        })

        window.Tensei.request.get = jest
            .fn()
            .mockResolvedValueOnce({
                data: {
                    data: tableData,
                    page: 1,
                    total: 50,
                    perPage: 10,
                    pageCount: 2,
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: tableData,
                    page: 1,
                    total: 50,
                    perPage: 25,
                    pageCount: 2,
                },
            })

        userEvent.selectOptions(perPageBox, ['10'])

        await waitFor(() =>
            expect(window.Tensei.request.get).toHaveBeenCalledWith(
                'resources/posts?per_page=10&page=1&search=&fields=name,description,content'
            )
        )
        userEvent.selectOptions(perPageBox, ['25'])

        await waitFor(() =>
            expect(window.Tensei.request.get).toHaveBeenCalledWith(
                'resources/posts?per_page=25&page=1&search=&fields=name,description,content'
            )
        )
    })

    test('Should have the correct showing Showing from 0 to 25 of 150 entries message', async () => {
        render(<WithAuthComponent {...props} />)
        const perPageBox = screen.getByRole('combobox', { name: 'per-page' })
        const paginationInfo = await screen.findByTestId('pagination-info')

        window.Tensei.request.get = jest
            .fn()
            .mockResolvedValueOnce({
                data: {
                    data: tableData,
                    page: 1,
                    total: 50,
                    perPage: 10,
                    pageCount: 2,
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: tableData,
                    page: 1,
                    total: 50,
                    perPage: 25,
                    pageCount: 2,
                },
            })

        userEvent.selectOptions(perPageBox, ['10'])

        await waitFor(() =>
            expect(paginationInfo).toHaveTextContent(
                'Showing 0 to 10 of 50 entries'
            )
        )

        userEvent.selectOptions(perPageBox, ['25'])

        await waitFor(() =>
            expect(paginationInfo).toHaveTextContent(
                'Showing 0 to 25 of 50 entries'
            )
        )
        await waitFor(() =>
            expect(window.Tensei.request.get).toHaveBeenCalledTimes(2)
        )
    })
    test('Should show all actions in the actions dropdown', async () => {
        render(<WithAuthComponent {...props} />)

        const [actionsLink] = await screen.findAllByTestId('action-link')
        userEvent.click(actionsLink)

        const allActions = await screen.findAllByRole('menuitem')

        expect(allActions).toHaveLength(1)
        expect(
            await screen.findByRole('menuitem', { name: 'Publish on' })
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: 'Prevent publish' })
        ).not.toBeInTheDocument()
    })
})
