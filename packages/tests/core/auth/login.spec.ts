import Knex from 'knex'
import Supertest from 'supertest'
import isAfter from 'date-fns/isAfter'

import { setup, createAdminUser } from '../../helpers'

test('validates login data and returns error messages with a 422', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post('/api/login').send({})

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

test('returns a 422 if user does not exist in database', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post('/api/login').send({
        email: 'hey@unknown-user.io',
        password: 'password',
        rememberMe: true,
    })

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

test('returns a 422 if user password is wrong', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const user = await createAdminUser(databaseClient)

    const response = await client.post('/api/login').send({
        email: user.email,
        password: 'WRONG_PASSWORD',
        rememberMe: true,
    })

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

test('returns a 200, and creates a new session when correct credentials are passed', async () => {
    const { app, databaseClient } = await setup()

    const knex: Knex = databaseClient

    const client = Supertest(app)

    const user = await createAdminUser(knex)

    expect(await knex('sessions').select('*')).toHaveLength(0)

    const response = await client.post('/api/login').send({
        email: user.email,
        password: user.password,
    })

    expect(response.status).toBe(200)
    expect(response.header['set-cookie']).toHaveLength(1)

    expect(response.body).toMatchSnapshot()

    const sessions = await knex('sessions').select('*')

    expect(sessions).toHaveLength(1)

    const session = JSON.parse(sessions[0].sess)

    expect(session.user).toBe(user.id)
})

test('can login correctly with remember me', async () => {
    const { app, databaseClient } = await setup()

    const knex: Knex = databaseClient

    const client = Supertest(app)

    const user = await createAdminUser(knex)

    const response = await client.post('/api/login').send({
        email: user.email,
        password: user.password,
        rememberMe: true,
    })

    expect(response.status).toBe(200)
    expect(response.header['set-cookie']).toHaveLength(1)

    expect(response.body).toMatchSnapshot()

    const sessions = await knex('sessions').select('*')

    const session = JSON.parse(sessions[0].sess)

    expect(isAfter(new Date(session.cookie.expires), new Date())).toBeTruthy()
})
