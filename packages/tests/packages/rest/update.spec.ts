import Faker from 'faker'
import Supertest from 'supertest'

import { setup, fakePost } from './setup'

test(`validate payload before reousrce update (users)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const postDetails = {
        ...fakePost(),
        title: 'A new post',
        user: user.id
    }

    const updateDetails = {
        ...postDetails,
        description: null
    }

    const post = instance.ctx.orm.em.create('Post', postDetails)
    await instance.ctx.orm.em.persistAndFlush(post)

    const response = await client
        .patch(`/api/resources/posts/${post.id}`)
        .send(updateDetails)

    expect(response.status).toBe(422)
    expect(response.body.message)
    expect(response.body.errors).toEqual([
        {
            message: 'The description is required.',
            validation: 'required',
            field: 'description'
        }
    ])
})
