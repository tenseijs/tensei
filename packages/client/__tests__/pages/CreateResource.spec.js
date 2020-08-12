import React from 'react'
import { cleanup, render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import setupPage from '~/testSetup/setupPage'
import { resources } from '~/testSetup/data'
import FlamingoMock from '~/testSetup/Flamingo'
import CreateResource from '~/pages/CreateResource'
import Dashboard from '~/pages/Dashboard'

describe('Test the create resource page', () => {
    beforeEach(() => {
        window.Flamingo = FlamingoMock
    })
    afterEach(cleanup)
    test('create resource page should match snapshot', () => {
        const match = { params: { resource: 'posts' } }
        const props = { match, resources }
        const { asFragment } = render(<CreateResource {...props} />)
        expect(asFragment()).toMatchSnapshot()
    })
    test('can create a resource i.e post', () => {
        const match = { params: { resource: 'posts' } }
        const props = { match, resources, history: { push: jest.fn() } }

        window.Flamingo = {
            ...FlamingoMock,
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        const { debug, getByTestId, getAllByText, getByLabelText } = render(
            <CreateResource {...props} />
        )
        expect(getByTestId('resource-title')).toBeInTheDocument()
        expect(getAllByText(/Create post/i)).toHaveLength(2)

        const nameField = getByLabelText('name')
        const descriptionField = getByLabelText('description')
        const contentField = getByLabelText('content')
        const submitBtn = getByTestId('submit-button')

        fireEvent.change(nameField, { target: { value: 'new post' } })
        fireEvent.change(descriptionField, {
            target: { value: 'new description' },
        })
        fireEvent.change(contentField, { target: { value: 'fresh content' } })

        fireEvent.click(submitBtn)

        expect(window.Flamingo.request.post).toHaveBeenCalled()
    })
})
