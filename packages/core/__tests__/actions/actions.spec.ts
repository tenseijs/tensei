import Knex from 'knex'
import Supertest from 'supertest'
import isAfter from 'date-fns/isAfter'

import { setup, createAdminUser, cleanup } from '../helpers'

test('runs an action that returns html', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post('/api/resources/posts/actions/archive')

    expect(response.status).toBe(201)
    expect(response.body.html).toMatch(
        /SOME EXAMPLE HTML TO BE SET ON THE DOM/i
    )

    await cleanup(databaseClient)
})

test('validates an action with input fields', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post(
        '/api/resources/posts/actions/publish-on'
    )

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()

    await cleanup(databaseClient)
})

test('runs an action with fields that returns a push', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post('/api/resources/posts/actions/fix-seo')

    expect(response.status).toBe(202)
    expect(response.body).toMatchSnapshot()

    await cleanup(databaseClient)
})

test('runs an action with fields that returns an array of validation errors', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post(
        '/api/resources/posts/actions/check-status'
    )

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()

    await cleanup(databaseClient)
})
