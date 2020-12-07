import Faker, { fake, lorem } from 'faker'
import Supertest from 'supertest'
import { setup, fakePost } from './setup'

test(`paginates resources appropriately (posts)`, async () => {
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
        Array.from({ length: 30 }).map(async () => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    )

    let response = await client.get(`/api/resources/posts`).send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(30)
    expect(response.body.page).toBe(1)
    expect(response.body.perPage).toBe(25)
    expect(response.body.pageCount).toBe(2)

    response = await client
        .get(`/api/resources/posts?perPage=10&page=2`)
        .send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(30)
    expect(response.body.page).toBe(2)
    expect(response.body.perPage).toBe(25)
})
test(`show only selected fields (posts) `, async () => {
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
        Array.from({ length: 30 }).map(async () => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    )

    const response = await client
        .get(`/api/resources/posts?perPage=10&page=1&fields=id,title,category`)
        .send(userDetails)

    expect(response.status).toBe(200)

    response.body.data.map(d => {
        expect(Object.keys(d)).toHaveLength(3)
        expect(Object.keys(d)).toEqual(['id', 'title', 'category'])
    })
})
test(`can search on searchable fields on resource (posts) `, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const titles = ['new title 1', 'new title 2']

    await Promise.all(
        titles.map(title => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    )

    let response = await client
        .get(`/api/resources/posts?perPage=10&page=1&search=new title 1`)
        .send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(1)
    expect(response.body.data[0].title).toBe(titles[0])

    response = await client
        .get(`/api/resources/posts?perPage=10&page=1&search=new title 2`)
        .send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(1)
    expect(response.body.data[0].title).toBe(titles[1])

    response = await client
        .get(`/api/resources/posts?perPage=10&page=1&search=new title`)
        .send(userDetails)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(2)

    response.body.data.map((d: { title: string }, i: number) => {
        expect(d.title).toBe(titles[i])
    })
})
test(`find all related resources (posts) `, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const [user1, user2] = await Promise.all(
        [Faker.internet.exampleEmail(), Faker.internet.exampleEmail()].map(
            email => {
                const entity = instance.ctx.orm.em.create('User', {
                    ...userDetails,
                    email
                })
                return instance.ctx.orm.em.persistAndFlush(entity)
            }
        )
    ) as any

    await Promise.all(
        Array.from({ length: 3 }).map(() => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    )

    await Promise.all(
        Array.from({ length: 4 }).map(() => {
            const entity = instance.ctx.orm.em.create('Post', {
                ...fakePost(),
                title: lorem.words(3).slice(0, 23),
                user: user.id
            })
            return instance.ctx.orm.em.persistAndFlush(entity)
        })
    )

    // this is to test for the first user

    let response = await client
        .get(`/api/resources/users/${user1.id}/posts`)
        .send({ ...userDetails, email: user1.email })

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(3)

    response.body.data.map((d: { user: number }) => {
        expect(d.user).toBe(1)
    })

    // this is to test for the second user

    response = await client
        .get(`/api/resources/users/${user2.id}/posts`)
        .send({ ...userDetails, email: user2.email })

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(4)

    response.body.data.map((d: { user: number }) => {
        expect(d.user).toBe(2)
    })
})
test(`throws error when related resource is not found (posts) `, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const wrongResource = 'pictures'

    let response = await client
        .get(`/api/resources/users/${user.id}/${wrongResource}`)
        .send(userDetails)

    expect(response.status).toBe(404)
    expect(response.body.message).toEqual(
        `Resource ${wrongResource} not found.`
    )
})
test(`throws error when related resource has no relation with resource (posts) `, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails) as any
    await instance.ctx.orm.em.persistAndFlush(user)

    const noRelationResource = 'Reaction'

    let response = await client
        .get(`/api/resources/users/${user.id}/reactions`)
        .send(userDetails)

    expect(response.status).toBe(404)
    expect(response.body.message).toEqual(
        `Related field not found between User and ${noRelationResource}.`
    )
})
test(`throw error when getting a single resource is not found (user)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails)
    await instance.ctx.orm.em.persistAndFlush(user)

    const response = await client
        .get(`/api/resources/users/10`)
        .send(userDetails)

    expect(response.status).toBe(404)
    expect(response.body.message).toEqual(
        'Could not find a resource with id 10'
    )
})
test(`throws error when system cannot find resource (user)`, async () => {
    const instance = await setup()
    const client = Supertest(instance.app)

    const userDetails = {
        email: Faker.internet.exampleEmail(),
        full_name: Faker.name.findName(),
        password: 'password'
    }

    const user = instance.ctx.orm.em.create('User', userDetails)
    await instance.ctx.orm.em.persistAndFlush(user)

    const wrongID = 5

    const response = await client
        .get(`/api/resources/users/${wrongID}`)
        .send(userDetails)

    expect(response.status).toBe(404)
    expect(response.body.message).toBe(
        `Could not find a resource with id ${wrongID}`
    )
})
