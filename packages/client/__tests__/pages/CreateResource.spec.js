import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import setupPage from '~/testSetup/setupPage'
import Auth from '~/store/auth'
import { resources } from '~/testSetup/data'
import FlamingoMock from '~/testSetup/Flamingo'
import CreateResource from '~/pages/CreateResource'

const WithAuthComponent = (props) => (
    <Auth.Provider
        value={{
            authorizedToCreate: jest.fn(() => Promise.resolve(true)),
        }}
    >
        <CreateResource {...props} />
    </Auth.Provider>
)

describe('Test the create resource page', () => {
    beforeEach(() => {
        window.Flamingo = FlamingoMock
    })

    test('create resource page should match snapshot', () => {
        const match = { params: { resource: 'posts' } }
        const props = {
            match,
            resources,
        }

        const { asFragment } = render(<WithAuthComponent {...props} />)

        expect(asFragment()).toMatchSnapshot()
    })

    test('can create a resource i.e post', () => {
        const match = { params: { resource: 'posts' } }
        const props = {
            match,
            resources,
            history: { push: jest.fn() },
        }

        window.Flamingo = {
            ...FlamingoMock,
            request: { post: jest.fn(() => Promise.resolve(true)) },
        }
        render(<WithAuthComponent {...props} />)

        expect(screen.getByTestId('resource-title')).toBeInTheDocument()
        expect(screen.getAllByText(/Create post/i)).toHaveLength(2)

        const nameField = screen.getByLabelText('name')
        const descriptionField = screen.getByLabelText('description')
        const contentField = screen.getByLabelText('content')
        const submitBtn = screen.getByTestId('submit-button')

        fireEvent.change(nameField, { target: { value: 'new post' } })
        fireEvent.change(descriptionField, {
            target: { value: 'new description' },
        })
        fireEvent.change(contentField, { target: { value: 'fresh content' } })

        fireEvent.click(submitBtn)

        expect(window.Flamingo.request.post).toHaveBeenCalled()
    })
})
