import Knex from 'knex'
import Faker from 'faker'
import Supertest from 'supertest'
import { auth } from '@tensei/auth'
import { generateSecret, totp } from 'speakeasy'

import { setup, createAuthUser, cleanup } from '../helpers'

const generateSecretMock = (generateSecret as unknown) as jest.Mock<
    typeof generateSecret
>

const totpVerifyMock = (totp.verify as unknown) as jest.Mock<typeof totp.verify>

jest.mock('speakeasy')
;['mysql', 'sqlite3', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - a user can enable 2fa on her account`, async () => {
        const sampleBase32 = Faker.lorem.word()
        const sampleOtpAuthUser = Faker.lorem.word()

        generateSecretMock.mockImplementation(
            () =>
                ({
                    base32: sampleBase32,
                    otpauth_url: sampleOtpAuthUser
                } as any)
        )

        const { app, getDatabaseClient, manager } = await setup({
            databaseClient
        })

        const knex = getDatabaseClient()

        const user = await createAuthUser(knex)

        const client = Supertest(app)

        const {
            body: { token: jwt }
        } = await client.post('/auth/login').send(user)

        const response = await client
            .post('/auth/two-factor/enable')
            .set('Authorization', `Bearer ${jwt}`)

        expect(response.status).toBe(200)
        expect(response.body.dataURL).toMatch('data:image/png;base64')

        let freshUser = await manager({} as any)('Customer').findOneById(
            user.id
        )

        expect(freshUser.get('two_factor_enabled')).toBe('0')
        expect(freshUser.get('two_factor_secret')).toBe(sampleBase32)
    })

    test(`${databaseClient} - a user can confirm enable 2fa on her account`, async () => {
        const sampleBase32 = Faker.lorem.word()
        const valid2faOtp = Faker.random.number(300000)

        totpVerifyMock.mockImplementation(() => jest.fn(() => true))

        const { app, getDatabaseClient, manager } = await setup({
            databaseClient
        })

        const knex = getDatabaseClient()

        const user = await createAuthUser(knex, {
            two_factor_secret: sampleBase32,
            two_factor_enabled: false
        })

        const client = Supertest(app)

        const {
            body: { token: jwt }
        } = await client.post('/auth/login').send(user)

        const response = await client
            .post('/auth/two-factor/confirm')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                token: valid2faOtp
            })

        expect(response.status).toBe(200)
        expect(response.body).toMatchSnapshot()

        let freshUser = await manager({} as any)('Customer').findOneById(
            user.id
        )

        expect(freshUser.get('two_factor_enabled')).toBe('1')
        expect(freshUser.get('two_factor_secret')).toBe(sampleBase32)
    })

    test(`${databaseClient} - a user can disable 2fa on her account`, async () => {
        const sampleBase32 = Faker.lorem.word()
        const valid2faOtp = Faker.random.number(300000)

        totpVerifyMock.mockImplementation(() => jest.fn(() => true))

        const { app, getDatabaseClient, manager } = await setup({
            databaseClient
        })

        const knex = getDatabaseClient()

        const user = await createAuthUser(knex, {
            two_factor_secret: sampleBase32,
            two_factor_enabled: true
        })

        const client = Supertest(app)

        const {
            body: { token }
        } = await client.post('/auth/login').send({
            ...user,
            token: valid2faOtp
        })

        const response = await client
            .post('/auth/two-factor/disable')
            .set('Authorization', `Bearer ${token}`)
            .send({
                token: valid2faOtp
            })

        expect(response.status).toBe(200)
        expect(response.body).toMatchSnapshot()

        let freshUser = await manager({} as any)('Customer').findOneById(
            user.id
        )

        expect(freshUser.get('two_factor_secret')).toBe(null)
        expect(freshUser.get('two_factor_enabled')).toBe('0')
    })
})

afterAll(async () => {
    await cleanup()
})
