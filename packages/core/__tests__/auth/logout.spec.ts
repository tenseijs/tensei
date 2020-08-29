import Supertest from 'supertest'
import { setup, createAdminUser, cleanup } from '../helpers'

test('can successfully logout when administrator is logged in', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const user = await createAdminUser(databaseClient)

    const cookie = (
        await client.post('/api/login').send({
            ...user,
            password: 'password'
        })
    ).header['set-cookie'][0]
        .split('=')[1]
        .split(';')[0]

    expect(await databaseClient('sessions').select('*')).toHaveLength(1)

    const response = await client
        .post('/api/logout')
        .set('Cookie', [`connect.sid=${cookie};`])

    expect(response.header['set-cookie']).toBeFalsy()
    expect(await databaseClient('sessions').select('*')).toHaveLength(0)

    await cleanup(databaseClient)
})
