import Supertest from 'supertest'
import {
    setup,
    createAdminUser,
    cleanup,
    createAdminUserMongoDB,
    getAllRecordsMongoDB,
    getAllRecordsKnex,
    getTestDatabaseClients
} from '../../helpers'

getTestDatabaseClients().forEach((databaseClient: any) => {
    test(`${databaseClient} - can successfully logout when administrator is logged in`, async () => {
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })

        const dbClient = getDatabaseClient()

        const client = Supertest(app)

        const user =
            databaseClient === 'mongodb'
                ? await createAdminUserMongoDB(dbClient)
                : await createAdminUser(dbClient)

        const cookie = (
            await client.post('/admin/api/login').send({
                ...user,
                password: 'password'
            })
        ).header['set-cookie'][0]
            .split('=')[1]
            .split(';')[0]

        if (databaseClient === 'mongodb') {
            expect(
                await getAllRecordsMongoDB(dbClient, 'sessions')
            ).toHaveLength(1)
        } else {
            expect(await getAllRecordsKnex(dbClient, 'sessions')).toHaveLength(
                1
            )
        }

        const response = await client
            .post('/admin/api/logout')
            .set('Cookie', [`connect.sid=${cookie};`])

        expect(response.header['set-cookie']).toBeFalsy()
        if (databaseClient === 'mongodb') {
            expect(
                await getAllRecordsMongoDB(dbClient, 'sessions')
            ).toHaveLength(0)
        } else {
            expect(await getAllRecordsKnex(dbClient, 'sessions')).toHaveLength(
                0
            )
        }
    })
})

afterAll(async () => {
    await cleanup()
})
