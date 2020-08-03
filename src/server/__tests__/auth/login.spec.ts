import Path from 'path'
import Bcrypt from 'bcryptjs'
import Supertest from 'supertest'
import FlamingoServiceProvider from '../../providers/FlamingoServiceProvider'

describe('The login endpoint', () => {
    process.env.DATABASE_URI = 'mongodb://localhost/flamingo-testdb'

    const setup = async () => {
        let instance = new FlamingoServiceProvider(
        )

        await instance.register()

        return instance
    }

    it('validates the data before processing the login', async () => {
        const { app, client: dbClient } = await setup()

        const client = Supertest(app)

        const response = await client.post('/api/login').send({})

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()

        await dbClient?.close()
    })

    it('returns validation errors if user is not found', async () => {
        const { app, client: dbClient } = await setup()

        const client = Supertest(app)

        const response = await client.post('/api/login').send({
            email: 'hey@unknown-user.io',
            password: 'password',
        })

        expect(response.status).toBe(422)
        expect(response.body).toMatchSnapshot()

        await dbClient?.close()
    })

    it('can correctly login an administrator', async () => {
        const instance = await setup()

        await instance.db?.admin().deleteMany({})

        const testFirstName = 'Hey'
        const testPassword = 'password'
        const testLastName = 'Flamingo'
        const testEmail = 'hey@flamingo.io'

        const client = Supertest(instance.app)

        await instance.db?.admin().insertOne({
            email: testEmail,
            password: Bcrypt.hashSync(testPassword),
            firstName: testFirstName,
            lastName: testLastName,
        })

        const response = await client.post('/api/login').send({
            email: testEmail,
            password: testPassword,
        })

        expect(response.status).toBe(200)

        await instance.client?.close()
    })
})
