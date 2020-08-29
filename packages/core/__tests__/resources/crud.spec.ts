import Faker, { fake } from 'faker'
import Supertest from 'supertest'

import { setup, fakePostData } from '../helpers'

test('can create a resource with correct values (posts)', async () => {
    const { app, resourceManager } = await setup({
        admin: {
            permissions: ['create:posts']
        } as any
    })

    const user = (
        await resourceManager().create({} as any, 'users', {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        })
    ).toJSON()

    const post = {
        ...fakePostData(),
        user_id: user.id
    }

    const client = Supertest(app)

    const response = await client.post(`/api/resources/posts`).send(post)

    expect(response.status).toBe(201)
    expect(response.body.title).toBe(post.title)
    expect(response.body.description).toBe(post.description)
})

test('can create a resource with correct values (user)', async () => {
    const { app } = await setup({
        admin: {
            permissions: ['create:users']
        } as any
    })

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const client = Supertest(app)

    const response = await client.post(`/api/resources/users`).send(userDetails)

    expect(response.status).toBe(201)
    expect(response.body.email).toBe(userDetails.email)
    expect(response.body.full_name).toBe(userDetails.full_name)
})

test('can get multiple resources (users)', async () => {
    const { app, resourceManager } = await setup({
        admin: {
            permissions: ['create:users']
        } as any
    })

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    await resourceManager().create({} as any, 'users', userDetails)

    const client = Supertest(app)

    const response = await client.get(`/api/resources/users`).send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.data[0].email).toBe(userDetails.email)
    expect(response.body.data[0].full_name).toBe(userDetails.full_name)
})

test('can update a resource (posts)', async () => {
    const { app, resourceManager } = await setup({
        admin: {
            permissions: ['update:users']
        } as any
    })

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const updateDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName()
    }

    const user = (
        await resourceManager().create({} as any, 'users', userDetails)
    ).toJSON()

    const client = Supertest(app)

    const response = await client
        .patch(`/api/resources/users/${user.id}`)
        .send(updateDetails)

    expect(response.status).toBe(200)
    expect(response.body.email).toBe(updateDetails.email)
    expect(response.body.full_name).toBe(updateDetails.full_name)
})

test('can get a single resource (user)', async () => {
    const { app, resourceManager } = await setup({
        admin: {
            permissions: ['create:users']
        } as any
    })

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = (
        await resourceManager().create({} as any, 'users', userDetails)
    ).toJSON()

    const client = Supertest(app)

    const response = await client
        .get(`/api/resources/users/${user.id}`)
        .send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.email).toBe(userDetails.email)
    expect(response.body.full_name).toBe(userDetails.full_name)
})
