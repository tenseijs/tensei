import Knex from 'knex'
import Faker from 'faker'
import Supertest from 'supertest'

import { setup, createAdminUser } from '../helpers'

jest.mock('speakeasy')
;['mysql', 'sqlite3', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - validates login data and returns error messages with a 422`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const response = await client.post('/auth/login').send({})

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 422 if user does not exist in database`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const response = await client.post('/auth/login').send({
            email: 'hey@unknown-user.io',
            password: 'password',
            rememberMe: true
        })

        expect(response.status).toBe(401)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 422 if user password is wrong`, async () => {
        const { app, databaseClient: knex } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const user = await createAdminUser(knex)

        const response = await client.post('/auth/login').send({
            email: user.email,
            password: 'WRONG_PASSWORD',
            rememberMe: true
        })

        expect(response.status).toBe(401)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 200, and creates a new session when correct credentials are passed`, async () => {
        const { app, databaseClient: knexClient, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const userData = {
            name: Faker.name.findName(),
            email: Faker.internet.email(),
            password: 'password'
        }

        await manager({} as any)('Customer').create(userData)

        const response = await client.post('/auth/login').send({
            email: userData.email,
            password: userData.password
        })

        expect(response.status).toBe(200)

        expect(response.body).toEqual({
            token: expect.any(String),
            user: {
                email: userData.email,
                created_at: expect.any(String),
                updated_at: expect.any(String),
                id: expect.any(Number),
                name: userData.name,
                email_verified_at: null,
                two_factor_enabled: null,
                roles: []
            }
        })
    })
})
