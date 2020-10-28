import Knex from 'knex'
import Supertest from 'supertest'
import isAfter from 'date-fns/isAfter'

import {
    setup,
    createAdminUser,
    cleanup,
    createAdminUserMongoDB,
    getAllRecordsKnex,
    getAllRecordsMongoDB,
    getTestDatabaseClients
} from '../../helpers'

getTestDatabaseClients().forEach((databaseClient: any) => {
    test(`${databaseClient} - validates login data and returns error messages with a 422`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const response = await client.post('/admin/api/login').send({})

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 422 if user does not exist in database`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const response = await client.post('/admin/api/login').send({
            email: 'hey@unknown-user.io',
            password: 'password',
            rememberMe: true
        })

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 422 if user password is wrong`, async () => {
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const user =
            databaseClient === 'mongodb'
                ? await createAdminUserMongoDB(getDatabaseClient())
                : await createAdminUser(getDatabaseClient())

        const response = await client.post('/admin/api/login').send({
            email: user.email,
            password: 'WRONG_PASSWORD',
            rememberMe: true
        })

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 200, and creates a new session when correct credentials are passed`, async () => {
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })

        const dbClient = getDatabaseClient()

        const client = Supertest(app)

        const user =
            databaseClient === 'mongodb'
                ? await createAdminUserMongoDB(dbClient)
                : await createAdminUser(dbClient)

        if (databaseClient === 'mongodb') {
            expect(
                await getAllRecordsMongoDB(dbClient, 'sessions')
            ).toHaveLength(0)
        } else {
            expect(await getAllRecordsKnex(dbClient, 'sessions')).toHaveLength(
                0
            )
        }

        const response = await client.post('/admin/api/login').send({
            email: user.email,
            password: user.password
        })

        expect(response.status).toBe(200)
        expect(response.header['set-cookie']).toHaveLength(1)

        expect(response.body).toMatchSnapshot()

        let sessions: any[] = []

        if (databaseClient === 'mongodb') {
            sessions = await getAllRecordsMongoDB(dbClient, 'sessions')
        } else {
            sessions = await getAllRecordsKnex(dbClient, 'sessions')
        }

        if (databaseClient === 'mongodb') {
            expect(JSON.parse(sessions[0].session).user).toBe(
                user.id.toString()
            )
        } else if (databaseClient === 'pg') {
            expect(sessions[0].sess.user).toBe(user.id)
        } else {
            expect(JSON.parse(sessions[0].sess).user).toBe(user.id)
        }
    })

    test(`${databaseClient} - can login correctly with remember me`, async () => {
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })

        const dbClient: any = getDatabaseClient()

        const client = Supertest(app)

        const user =
            databaseClient === 'mongodb'
                ? await createAdminUserMongoDB(dbClient)
                : await createAdminUser(dbClient)

        const response = await client.post('/admin/api/login').send({
            email: user.email,
            password: user.password,
            rememberMe: true
        })

        expect(response.status).toBe(200)
        expect(response.header['set-cookie']).toHaveLength(1)

        expect(response.body).toMatchSnapshot()

        let sessions: any[] = []

        if (databaseClient === 'mongodb') {
            sessions = await getAllRecordsMongoDB(dbClient, 'sessions')
        } else {
            sessions = await getAllRecordsKnex(dbClient, 'sessions')
        }

        if (databaseClient === 'mongodb') {
            expect(
                isAfter(
                    new Date(JSON.parse(sessions[0].session).cookie.expires),
                    new Date()
                )
            ).toBeTruthy()
        } else if (databaseClient === 'pg') {
            expect(
                isAfter(new Date(sessions[0].sess.cookie.expires), new Date())
            ).toBeTruthy()
        } else {
            expect(
                isAfter(
                    new Date(JSON.parse(sessions[0].sess).cookie.expires),
                    new Date()
                )
            ).toBeTruthy()
        }
    })
})

afterAll(async () => {
    await cleanup()
})
