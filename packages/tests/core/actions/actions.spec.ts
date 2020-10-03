import Supertest from 'supertest'

import { setup, cleanup } from '../../helpers'

test('runs an action that returns html', async () => {
    const { app } = await setup({
        admin: {} as any
    })

    const client = Supertest(app)

    const response = await client.post(
        '/admin/api/resources/posts/actions/archive'
    )

    expect(response.status).toBe(201)
    expect(response.body.html).toMatch(
        /SOME EXAMPLE HTML TO BE SET ON THE DOM/i
    )
})

test('validates an action with input fields', async () => {
    const { app } = await setup({
        admin: {} as any
    })

    const client = Supertest(app)

    const response = await client.post(
        '/admin/api/resources/posts/actions/publish-on'
    )

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

test('runs an action with fields that returns a push', async () => {
    const { app } = await setup({
        admin: {} as any
    })

    const client = Supertest(app)

    const response = await client.post(
        '/admin/api/resources/posts/actions/fix-seo'
    )

    expect(response.status).toBe(202)
    expect(response.body).toMatchSnapshot()
})

test('runs an action with fields that returns an array of validation errors', async () => {
    const { app } = await setup({
        admin: {} as any
    })

    const client = Supertest(app)

    const response = await client.post(
        '/admin/api/resources/posts/actions/check-status'
    )

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

afterAll(async () => {
    await cleanup()
})
