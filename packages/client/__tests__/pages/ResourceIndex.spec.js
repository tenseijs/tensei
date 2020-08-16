import React from 'react'
import { cleanup, render, fireEvent } from '@testing-library/react'
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
                    response: {
                        status: 200,
                        data: {
                            data: {
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
                            page: 1,
                            total: 2,
                            perPage: 10,
                            pageCount: 1,
                        },
                    },
                }),
            },
        }
    })
    afterEach(cleanup)
    test('resource index page should match snapshot', () => {
        const { asFragment } = render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )
        expect(asFragment()).toMatchSnapshot()
    })
    test('should load posts data and display on table', () => {
        const { debug } = render(
            <Router history={history}>
                <ResourceIndex {...props} />
            </Router>
        )

        expect(window.Flamingo.request.get).toHaveBeenCalled()
    })
    test('should be able to edit a post from the post table', () => {})
})
