import Supertest from 'supertest'

import { setup, createAdminUser, cleanup } from '../helpers'

test('can fetch the index.html file on all subroutes of the dashboard page', async () => {
    const { app } = await setup()

    const client = Supertest(app)

    const response = await client.get(`/admin`)

    expect(response.status).toBe(200)
    expect(response.text).toMatch('<div id="app"></div>')
    expect(response.text).toMatch('window.Flamingo.boot()')
    expect(response.text).toMatch("shouldShowRegistrationScreen: 'true'")
})

test('passes shouldShowRegistrationScreen: false option to client if an administrator already exists', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    await createAdminUser(databaseClient)

    const response = await client.get(`/admin`)

    expect(response.status).toBe(200)
    expect(response.text).toMatch("shouldShowRegistrationScreen: 'false'")
})

test('passes user to view if user is logged in', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const admin = await createAdminUser(databaseClient)

    const cookie = (
        await client.post('/api/login').send({
            email: admin.email,
            password: 'password'
        })
    ).header['set-cookie'][0]
        .split('=')[1]
        .split(';')[0]

    const response = await client
        .get(`/admin`)
        .set('Cookie', [`connect.sid=${cookie};`])

    expect(response.status).toBe(200)

    expect(response.text).toMatch(admin.name)
    expect(response.text).toMatch(admin.email)
})
