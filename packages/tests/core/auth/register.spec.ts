import Supertest from 'supertest'

import {
    setup,
    createAdminUser,
    cleanup,
    getAllRecordsKnex,
    getTestDatabaseClients
} from '../../helpers'

getTestDatabaseClients().forEach((databaseClient: any) => {
    test(`${databaseClient} -  validates registration data and returns error messages with a 422`, async () => {
        if (databaseClient === 'mongodb') {
            return true
        }
        const { app } = await setup(
            {
                databaseClient
            },
            true
        )

        const client = Supertest(app)

        const response = await client.post('/admin/api/register').send({})

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - returns a 422 if there is already an administrator in the database`, async () => {
        if (databaseClient === 'mongodb') {
            return true
        }
        const { app, getDatabaseClient } = await setup(
            {
                databaseClient
            },
            true
        )

        const dbClient = getDatabaseClient()

        const client = Supertest(app)

        await createAdminUser(dbClient)

        const response = await client.post('/admin/api/register').send({
            email: 'hey@unknown-user.io',
            password: 'password'
        })

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })

    test(`${databaseClient} - correctly creates an administrator user, logs in the user and returns a success message`, async () => {
        if (databaseClient === 'mongodb') {
            return true
        }
        const { app, getDatabaseClient } = await setup(
            {
                databaseClient,
                clearTables: false
            },
            true
        )

        const dbClient = getDatabaseClient()

        await dbClient('administrators').truncate()

        const client = Supertest(app)

        const response = await client.post('/admin/api/register').send({
            email: 'hey@admin.io',
            password: 'password',
            name: 'Hey Admin io'
        })

        expect(response.status).toBe(200)
        expect(response.body).toMatchSnapshot()
        expect(response.header['set-cookie']).toHaveLength(1)
    })

    test(`${databaseClient} - returns a 200, and creates a new session when correct credentials are passed`, async () => {
        if (databaseClient === 'mongodb') {
            return true
        }
        const { app, getDatabaseClient } = await setup(
            {
                databaseClient
            },
            true
        )

        const dbClient = getDatabaseClient()

        const client = Supertest(app)

        const user = await createAdminUser(dbClient)

        expect(await getAllRecordsKnex(dbClient, 'sessions')).toHaveLength(0)

        const response = await client.post('/admin/api/login').send({
            email: user.email,
            password: user.password
        })

        expect(response.status).toBe(200)
        expect(response.header['set-cookie']).toHaveLength(1)

        expect(response.body).toMatchSnapshot()

        let sessions: any[] = await getAllRecordsKnex(dbClient, 'sessions')

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
})

afterAll(async () => {
    await cleanup()
})
