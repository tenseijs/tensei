import Knex from 'knex'
import Faker from 'faker'
import Supertest from 'supertest'

import {
    setup,
    createAdminUser,
    cleanup,
    getTestDatabaseClients,
    createAdminUserMongoDB
} from '../helpers'

jest.mock('speakeasy')

getTestDatabaseClients().forEach((databaseClient: any) => {
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
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })

        const knex = getDatabaseClient()

        const client = Supertest(app)

        let user = null

        if (databaseClient === 'mongodb') {
            user = await createAdminUserMongoDB(knex)
        } else {
            user = await createAdminUser(knex)
        }

        const response = await client.post('/auth/login').send({
            email: user.email,
            password: 'WRONG_PASSWORD',
            rememberMe: true
        })

        expect(response.status).toBe(401)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 200, and creates a new session when correct credentials are passed`, async () => {
        const { app, manager } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const userData = {
            name: Faker.name.findName(),
            email: Faker.internet.email(),
            password: 'password'
        }

        await manager()('Customer').create(userData)

        const response = await client.post('/auth/login').send({
            email: userData.email,
            password: userData.password
        })

        expect(response.status).toBe(200)

        const user = await manager()('Customer').database().findOneByField('email', userData.email)

        expect(response.body.token).toBeDefined()
        expect(response.body.user.email).toBe(user.email)
        expect(response.body.user.id).toBe(user.id.toString())
        expect(response.body.user.created_at).toBe(user.created_at.toISOString())
    })
})

afterAll(async () => {
    await cleanup()
})
