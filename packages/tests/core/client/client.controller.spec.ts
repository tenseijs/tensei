import Supertest from 'supertest'

import { setup, createAdminUser, getTestDatabaseClients, createAdminUserMongoDB } from '../../helpers'


getTestDatabaseClients().forEach(databaseClient => {
    test(`${databaseClient} can fetch the index.html file on all subroutes of the dashboard page`, async () => {
        const { app } = await setup({
            databaseClient
        })
    
        const client = Supertest(app)
    
        const response = await client.get(`/admin`)
    
        expect(response.status).toBe(200)
        expect(response.text).toMatch('<div id="app"></div>')
        expect(response.text).toMatch('window.Tensei.boot()')
        expect(response.text).toMatch("shouldShowRegistrationScreen: 'true'")
    })
    
    test(`${databaseClient} passes shouldShowRegistrationScreen: false option to client if an administrator already exists`, async () => {
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })
    
        const client = Supertest(app)
    
        if (databaseClient === 'mongodb') {
            await createAdminUserMongoDB(getDatabaseClient())
        } else {
            await createAdminUser(getDatabaseClient())
        }
    
        const response = await client.get(`/admin`)
    
        expect(response.status).toBe(200)
        expect(response.text).toMatch("shouldShowRegistrationScreen: 'false'")
    })
    
    test(`${databaseClient} passes user to view if user is logged in`, async () => {
        const { app, getDatabaseClient } = await setup({
            databaseClient
        })
    
        const client = Supertest(app)

        let admin = null
    
        if (databaseClient === 'mongodb') {
            admin = await createAdminUserMongoDB(getDatabaseClient())
        } else {
            admin = await createAdminUser(getDatabaseClient())
        }
    
        const cookie = (
            await client.post('/admin/api/login').send({
                email: admin.email,
                password: 'password'
            })
        ).header['set-cookie'][0]
            .split('=')[1]
            .split(';')[0]
    
        const response = await client
            .get(`/admin`)
            .set('Cookie', [`connect.sid=${cookie};`])
    
        expect(response.status).toBe(200)
    
        expect(response.text).toMatch(admin.name)
        expect(response.text).toMatch(admin.email)
    })    
})
