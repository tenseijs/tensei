import Faker from 'faker'
import Supertest from 'supertest'

import { setup, fakePost } from './setup'

test(`cannot create another resource with unique constraint (posts)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const user = instance.ctx.orm.em.create('User', {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const post = {
        ...fakePost(),
        title: 'A new post',
        user: user.id
    }

    let response = await client.post(`/api/posts`).send(post)

    expect(response.status).toBe(201)

    response = await client.post(`/api/posts`).send(post)

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Validation failed.')
    expect(response.body.errors).toEqual([
        {
            message: 'A post already exists with title A new post.',
            field: 'title'
        }
    ])
})
test(`cannot create resource if required field is null (posts)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const user = instance.ctx.orm.em.create('User', {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const post = {
        ...fakePost(),
        title: 'A new post',
        description: null,
        user: user.id
    }

    let response = await client.post(`/api/posts`).send(post)

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Validation failed.')
    expect(response.body.errors).toEqual([
        {
            field: 'description',
            message: 'The description is required.',
            validation: 'required'
        }
    ])
})

test(`cannot create resource if creation rule is violated (posts)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const user = instance.ctx.orm.em.create('User', {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const post = {
        ...fakePost(),
        title: 'A new post',
        content: Faker.lorem.sentence(10000),
        user: user.id
    }

    let response = await client.post(`/api/posts`).send(post)

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Validation failed.')
    expect(response.body.errors).toEqual([
        {
            field: 'content',
            message: 'max validation failed on content',
            validation: 'max'
        }
    ])
})
