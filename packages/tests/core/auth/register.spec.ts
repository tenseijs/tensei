import Path from 'path'
import Knex from 'knex'
import Supertest from 'supertest'
import isAfter from 'date-fns/isAfter'

import { setup, createAdminUser } from '../../helpers'

['mysql', 'sqlite3'].forEach((databaseClient: any) => {
    test(`${databaseClient} -  validates registration data and returns error messages with a 422`, async () => {
        const { app } = await setup({
            databaseClient
        })
    
        const client = Supertest(app)
    
        const response = await client.post('/api/register').send({})
    
        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })
    
    test(`${databaseClient} - returns a 422 if there is already an administrator in the database`, async () => {
        const { app, databaseClient: knex } = await setup({
            databaseClient
        })
    
        const client = Supertest(app)
    
        await createAdminUser(knex)
    
        const response = await client.post('/api/register').send({
            email: 'hey@unknown-user.io',
            password: 'password',
        })
    
        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()
    })
    
    test(`${databaseClient} - correctly creates an administrator user, logs in the user and returns a success message`, async () => {
        const { app } = await setup({
            databaseClient
        })
    
        const client = Supertest(app)
    
        const response = await client.post('/api/register').send({
            email: 'hey@admin.io',
            password: 'password',
            name: 'Hey Admin io',
        })
    
        expect(response.status).toBe(200)
        expect(response.body).toMatchSnapshot()
        expect(response.header['set-cookie']).toHaveLength(1)
    })
    
    test(`${databaseClient} - returns a 200, and creates a new session when correct credentials are passed`, async () => {
        const { app, databaseClient: knex } = await setup({
            databaseClient
        })
 
        const client = Supertest(app)
    
        const user = await createAdminUser(knex)
    
        expect(await knex('sessions').select('*')).toHaveLength(0)
    
        const response = await client.post('/api/login').send({
            email: user.email,
            password: user.password,
        })
    
        expect(response.status).toBe(200)
        expect(response.header['set-cookie']).toHaveLength(1)
    
        expect(response.body).toMatchSnapshot()
    
        const sessions = await knex('sessions').select('*')
    
        expect(sessions).toHaveLength(1)
    
        const session = JSON.parse(sessions[0].sess)
    
        expect(session.user).toBe(user.id)
    })
    
    test(`${databaseClient} - can login correctly with remember me`, async () => {
        const { app, databaseClient: knex } = await setup({
            databaseClient
        })

        const client = Supertest(app)
    
        const user = await createAdminUser(knex)
    
        const response = await client.post('/api/login').send({
            email: user.email,
            password: user.password,
            rememberMe: true,
        })
    
        expect(response.status).toBe(200)
        expect(response.header['set-cookie']).toHaveLength(1)
    
        expect(response.body).toMatchSnapshot()
    
        const sessions = await knex('sessions').select('*')
    
        const session = JSON.parse(sessions[0].sess)
    
        expect(isAfter(new Date(session.cookie.expires), new Date())).toBeTruthy()
    })
    
})