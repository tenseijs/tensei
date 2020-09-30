import Knex from 'knex'
import Faker from 'faker'
import Supertest from 'supertest'

import { setup, createAuthUser } from '../helpers'

beforeEach(() => {
    jest.clearAllMocks()
})

jest.mock('speakeasy')
;['mysql', 'sqlite3', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - returns a 200, and creates a new session when correct credentials are passed`, async () => {
        const { app, databaseClient: knexClient, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const email_verification_token = Faker.random.alphaNumeric(10)

        const user = await createAuthUser(knexClient, {
            email_verification_token
        })

        const {
            body: { token: jwt }
        } = await client.post('/auth/login').send(user)

        const response = await client
            .post('/auth/emails/confirm')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                email_verification_token
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Email has been verified.')
    })
    test(`${databaseClient} - throws error when email verification token is invalid`, async () => {
        const { app, databaseClient: knexClient, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const email_verification_token = Faker.random.alphaNumeric(10)

        const user = await createAuthUser(knexClient, {
            email_verification_token
        })

        const {
            body: { token: jwt }
        } = await client.post('/auth/login').send(user)

        const response = await client
            .post('/auth/emails/confirm')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                email_verification_token: 'wrong123'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Invalid email verification token.')
    })
    test(`${databaseClient} - calls the mailer.sendRaw method when verifyEmails is enabled`, async () => {
        const { app, mailer } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const mailSendRawSpy = jest.spyOn(mailer, 'sendRaw')

        const response = await client.post('/auth/register').send({
            email: 'hey@admin.io',
            password: 'password',
            name: 'Hey Admin io'
        })

        expect(response.status).toBe(201)
        expect(mailSendRawSpy).toHaveBeenCalledTimes(1)
    })
})
