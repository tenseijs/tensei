import Faker, { lorem } from 'faker'
import Supertest from 'supertest'

import { setup, fakePost } from './setup'

test(`can delete resource by ID (posts)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const [post1, _] = await Promise.all(
        Array.from({ length: 2 }).map(() => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    ) as any

    let response = await client
        .delete(`/api/resources/posts/${post1.id}`)
        .send(userDetails)

    expect(response.status).toBe(204)

    response = await client.get(`/api/posts`).send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(1)
})
test(`throws error when resource ID is not found (posts)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    await Promise.all(
        Array.from({ length: 2 }).map(() => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    )

    const response = await client
        .delete(`/api/posts/21`)
        .send(userDetails)

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Validation failed.')
    expect(response.body.errors).toEqual([
        { message: 'Post resource with id 21 was not found.' }
    ])
})
