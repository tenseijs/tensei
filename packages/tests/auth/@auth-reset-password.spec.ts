import Knex from 'knex'
import Faker from 'faker'
import Supertest from 'supertest'

import { setup, createAdminUser } from '../helpers'

beforeEach(() => {
    jest.clearAllMocks()
})
jest.mock('speakeasy')
;['mysql', 'sqlite3', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - resets password successfully`, async () => {
        const { app, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const userData = {
            name: Faker.name.findName(),
            email: Faker.internet.email(),
            password: 'password'
        }

        const token = Faker.random.alphaNumeric(64)

        await manager({} as any)('Customer').create(userData)

        await manager({} as any)('Password Resets').create({
            email: userData.email,
            token,
            expires_at: Faker.date.future()
        })

        const response = await client.post('/auth/reset-password').send({
            password: 'new-password',
            token
        })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Password reset successful.')
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - throws 422 error when reset password token is expired`, async () => {
        const { app, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const userData = {
            name: Faker.name.findName(),
            email: Faker.internet.email(),
            password: 'password'
        }

        const token = Faker.random.alphaNumeric(64)

        await manager({} as any)('Customer').create(userData)

        await manager({} as any)('Password Resets').create({
            email: userData.email,
            token,
            expires_at: Faker.date.past()
        })

        const response = await client.post('/auth/reset-password').send({
            password: 'new-password',
            token
        })

        expect(response.status).toBe(422)
        expect(response.body).toEqual([
            {
                field: 'token',
                message: 'Invalid reset token.'
            }
        ])
        expect(response.body).toMatchSnapshot()
    })
    test(`${databaseClient} - throws 422 error when reset password token does not exist on DB`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const token = Faker.random.alphaNumeric(64)

        const response = await client.post('/auth/reset-password').send({
            password: 'new-password',
            token
        })

        expect(response.status).toBe(422)
        expect(response.body).toEqual([
            {
                field: 'token',
                message: 'Invalid reset token.'
            }
        ])
        expect(response.body).toMatchSnapshot()
    })
    test(`${databaseClient} - throws error when token is valid but user does not exist on the DB`, async () => {
        const { app, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const token = Faker.random.alphaNumeric(64)

        await manager({} as any)('Password Resets').create({
            email: Faker.internet.email(),
            token,
            expires_at: Faker.date.future()
        })

        const response = await client.post('/auth/reset-password').send({
            password: 'new-password',
            token
        })

        expect(response.status).toBe(500)
        expect(response.body.message).toEqual('User does not exist anymore.')
        expect(response.body).toMatchSnapshot()
    })
})
