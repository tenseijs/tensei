import Path from 'path'
import Knex from 'knex'
import Faker from 'faker'
import Bcrypt from 'bcryptjs'
import Supertest from 'supertest'
import { flamingo } from '../../Flamingo'

const setup = () => {
    process.env.DATABASE = 'mysql'
    process.env.DATABASE_URI = 'mysql://root@127.0.0.1/flamingotestdb'

    return flamingo().register()
}

test('validates login data and returns error messages with a 422', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post('/api/login').send({})

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()

    databaseClient.destroy()
})

test('returns a 422 if user does not exist in database', async () => {
    const { app, databaseClient } = await setup()

    const client = Supertest(app)

    const response = await client.post('/api/login').send({
        email: 'hey@unknown-user.io',
        password: 'password',
        rememberMe: true,
    })

    expect(response.status).toBe(422)
    expect(response.body).toMatchSnapshot()

    databaseClient.destroy()
})

test('returns a 200 and success message when correct credentials are passed', async () => {
    const { app, databaseClient } = await setup()

    const knex: Knex = databaseClient

    const client = Supertest(app)

    await knex('administrators').truncate()

    const user = {
        password: 'password',
        name: Faker.name.findName(),
        email: Faker.internet.exampleEmail(),
    }

    await knex('administrators').insert({
        name: user.name,
        email: user.email,
        password: Bcrypt.hashSync(user.password),
    })

    const response = await client.post('/api/login').send({
        email: user.email,
        password: user.password,
        rememberMe: true,
    })

    expect(response.status).toBe(200)
    expect(response.body).toMatchSnapshot()

    knex.destroy()
})
