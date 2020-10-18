import Supertest from 'supertest'
import Mongoose from 'mongoose'
import {
    setup,
    getAllRecordsMongoDB,
    cleanup,
    createAdminUserMongoDB,
    getTestDatabaseClients
} from '../../helpers'

test(`mongodb -  validates registration data and returns error messages with a 422`, async () => {
    if (!getTestDatabaseClients().includes('mongodb')) {
        return true
    }
    const { app } = await setup({
        databaseClient: 'mongodb'
    })

    const client = Supertest(app)

    const response = await client.post('/admin/api/register').send({})

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

test(`mongodb - returns a 422 if there is already an administrator in the database`, async () => {
    if (!getTestDatabaseClients().includes('mongodb')) {
        return true
    }
    const { app, getDatabaseClient } = await setup({
        databaseClient: 'mongodb'
    })

    const dbClient = getDatabaseClient()

    const client = Supertest(app)

    await createAdminUserMongoDB(dbClient)

    const response = await client.post('/admin/api/register').send({
        email: 'hey@unknown-user.io',
        password: 'password'
    })

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()
})

test(`mongodb - correctly creates an administrator user, logs in the user and returns a success message`, async () => {
    if (!getTestDatabaseClients().includes('mongodb')) {
        return true
    }
    const { app, getDatabaseClient } = await setup({
        databaseClient: 'mongodb',
        clearTables: false
    })

    const dbClient: Mongoose.Connection = getDatabaseClient()

    await dbClient.db.collection('administrator_roles').insertOne({
        slug: 'super-admin',
        name: 'Super Admin',
        permissions: []
    })

    await dbClient.db.dropCollection('administrators')

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

test(`mongodb - returns a 200, and creates a new session when correct credentials are passed`, async () => {
    if (!getTestDatabaseClients().includes('mongodb')) {
        return true
    }
    const { app, getDatabaseClient } = await setup({
        databaseClient: 'mongodb'
    })

    const dbClient = getDatabaseClient()

    const client = Supertest(app)

    const user = await createAdminUserMongoDB(dbClient)

    expect(await getAllRecordsMongoDB(dbClient, 'sessions')).toHaveLength(0)

    const response = await client.post('/admin/api/login').send({
        email: user.email,
        password: user.password
    })

    expect(response.status).toBe(200)
    expect(response.header['set-cookie']).toHaveLength(1)

    expect(response.body).toMatchSnapshot()

    let sessions: any[] = await getAllRecordsMongoDB(dbClient, 'sessions')

    expect(JSON.parse(sessions[0].session).user).toBe(user.id.toString())
})

afterAll(async () => {
    await cleanup()
})
