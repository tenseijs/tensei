import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Auth from '~/store/auth'
import { resources } from '~/testSetup/data'
import TenseiMock from '~/testSetup/Tensei'
import ResourceIndex from '~/pages/ResourceIndex'

const history = createMemoryHistory({ initialEntries: ['/resources/posts'] })
const match = { params: { resource: 'posts' } }
const props = {
    match,
    resources,
    history: { push: jest.fn() },
    location: { pathname: 'resource/posts' }
}

const WithAuthComponent = props => (
    <Router history={history}>
        <Auth.Provider
            value={{
                authorizedToCreate: jest.fn(() => Promise.resolve(true)),
                authorizedToUpdate: jest.fn(() => Promise.resolve(true)),
                authorizedToDelete: jest.fn(() => Promise.resolve(true)),
                authorizedToRunAction: jest.fn(() => true)
            }}
        >
            <ResourceIndex {...props} />
        </Auth.Provider>
    </Router>
)

describe('Test the resource index page', () => {
    beforeEach(() => {
        window.Tensei = {
            ...TenseiMock,
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
                                user_id: 2
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
                                user_id: 2
                            }
                        ],
                        page: 1,
                        total: 2,
                        perPage: 10,
                        pageCount: 1
                    }
                })
            }
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
            location: { pathname: 'resource/posts' }
        }
        const { rerender } = render(<WithAuthComponent {...props} />)

        expect(screen.getByText('Posts')).toBeInTheDocument()

        const newProps = {
            ...props,
            match: { params: { resource: 'news' } }
        }

        rerender(<WithAuthComponent {...newProps} />)

        expect(screen.queryByText('Posts')).not.toBeInTheDocument()
        expect(screen.getByText('News')).toBeInTheDocument()
    })
})
