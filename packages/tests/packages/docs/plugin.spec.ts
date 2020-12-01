import { setup } from './setup'
import Supertest from 'supertest'
import { rest } from '@tensei/rest'
import { route, plugin } from '@tensei/common'

test('Generates a new tag for each resource exposed to the API', async () => {
    const { app } = await setup()

    const client = Supertest(app)
    const response = await client.get('/docs.json')

    expect(response.body.tags).toEqual([
        { name: 'Tags' },
        { name: 'Comments' },
        { name: 'Users' },
        { name: 'Posts' },
        { name: 'Reactions' }
    ])
})

test('Generates a new object definition for all resources exposed to the API', async () => {
    const { app } = await setup()

    const client = Supertest(app)
    const response = await client.get('/docs.json')

    expect(response.body.definitions.ID).toEqual({
        type: 'string'
    })
    expect(response.body.definitions.PaginationMeta).toBeDefined()

    expect(response.body.definitions.Tag).toBeDefined()
    expect(response.body.definitions.TagInput).toBeDefined()
    expect(response.body.definitions.TagFetchResponse).toBeDefined()

    expect(response.body.definitions.Comment).toBeDefined()
    expect(response.body.definitions.CommentInput).toBeDefined()
    expect(response.body.definitions.CommentFetchResponse).toBeDefined()

    expect(response.body.definitions.User).toBeDefined()
    expect(response.body.definitions.UserInput).toBeDefined()
    expect(response.body.definitions.UserFetchResponse).toBeDefined()

    expect(response.body.definitions.Post).toBeDefined()
    expect(response.body.definitions.PostInput).toBeDefined()
    expect(response.body.definitions.PostFetchResponse).toBeDefined()

    expect(response.body.definitions.Reaction).toBeDefined()
    expect(response.body.definitions.ReactionInput).toBeDefined()
    expect(response.body.definitions.ReactionFetchResponse).toBeDefined()
})

test('Adds new route definitions to API documentation', async () => {
    const path = '/accessories/query'

    const { app } = await setup([
        plugin('New route').boot(async ({ extendRoutes }) => {
            extendRoutes([
                route('Fetch Accessories')
                    .get()
                    .path(path)
                    .extend({
                        docs: {
                            parameters: [
                                {
                                    required: true,
                                    name: 'id',
                                    in: 'body'
                                }
                            ],
                            tags: ['Accessory'],
                            responses: {
                                200: {
                                    description:
                                        'Accessories found successfully.'
                                }
                            }
                        }
                    })
            ])
        })
    ])

    const client = Supertest(app)
    const response = await client.get('/docs.json')

    expect(response.body.paths[path]).toEqual({
        get: {
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: ['Accessory'],
            parameters: [
                {
                    in: 'body',
                    name: 'id',
                    required: true
                }
            ],
            responses: {
                500: {
                    description: expect.any(String)
                },
                200: {
                    description: 'Accessories found successfully.'
                }
            }
        }
    })
})

test('Generates all routes for REST api', async () => {
    const { app } = await setup()

    const client = Supertest(app)
    const response = await client.get('/docs.json')

    expect(response.body).toMatchSnapshot()
})
