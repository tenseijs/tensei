import Knex from 'knex'
import Faker from 'faker'
import Supertest from 'supertest'

import { setup, createAdminUser } from '../helpers'

beforeEach(() => {
    jest.clearAllMocks()
})
jest.mock('speakeasy')
;['mysql', 'sqlite3', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - sends email on successful forgot password request`, async () => {
        const { app, manager, mailer } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const userData = {
            name: Faker.name.findName(),
            email: Faker.internet.email(),
            password: 'password'
        }

        await manager({} as any)('Customer').create(userData)

        const mailSendRawSpy = jest.spyOn(mailer, 'sendRaw')

        const response = await client.post('/auth/forgot-password').send({
            email: userData.email
        })

        expect(response.status).toBe(200)
        expect(mailSendRawSpy).toHaveBeenCalledTimes(1)
        expect(response.body.message).toBe(
            'Please check your email for steps to reset your password.'
        )
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 422 if user email does not exist`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        let response = await client.post('/auth/forgot-password').send({
            email: Faker.internet.email()
        })

        expect(response.status).toBe(422)
        expect(response.body).toEqual([
            {
                field: 'email',
                message: 'Invalid email address.'
            }
        ])
        expect(response.body).toMatchSnapshot()

        response = await client.post('/auth/forgot-password').send({
            email: 'example@gm.c'
        })

        expect(response.status).toBe(422)
        expect(response.body).toEqual([
            {
                field: 'email',
                message: 'Invalid email address.'
            }
        ])
        expect(response.body).toMatchSnapshot()
    })
})
