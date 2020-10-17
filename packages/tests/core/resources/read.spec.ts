import Faker, { lorem } from 'faker'
import Supertest from 'supertest'
import Mongoose from 'mongoose'

import { setup, postBuilder, cleanup } from '../../helpers'
;['sqlite3', 'mysql', 'pg', 'mongodb'].forEach((databaseClient: any) => {
    test(`${databaseClient} - paginates resources appropriately (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: [
                    'create:users',
                    'fetch:users',
                    'fetch:posts',
                    'create:posts'
                ]
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        await Promise.all(
            Array.from({ length: 30 }).map(() =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title: lorem.words(3).slice(0, 23),
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user.id
                })
            )
        )

        const client = Supertest(app)

        let response = await client
            .get(`/admin/api/resources/posts`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(30)
        expect(response.body.page).toBe(1)
        expect(response.body.perPage).toBe(25)
        expect(response.body.pageCount).toBe(2)

        response = await client
            .get(`/admin/api/resources/posts?perPage=10&page=2`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(30)
        expect(response.body.page).toBe(2)
        expect(response.body.perPage).toBe(25)
    })

    test(`${databaseClient} - filters resources correctly (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        await Promise.all(
            Array.from({ length: 10 }).map(() =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title: lorem.words(3).slice(0, 23),
                    av_cpc: 1200,
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user.id
                })
            )
        )

        await Promise.all(
            Array.from({ length: 15 }).map(() =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title: lorem.words(3).slice(0, 23),
                    av_cpc: 10410,
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user.id
                })
            )
        )

        await manager({} as any)('Post').create({
            ...postBuilder(),
            title: 'example title',
            av_cpc: 11,
            [databaseClient === 'mongodb' ? 'user' : 'user_id']: user.id
        })

        const client = Supertest(app)

        let response = await client
            .get(`/admin/api/resources/posts?filter[av_cpc:gt]=10000`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(15)

        response = await client
            .get(`/admin/api/resources/posts?filter[av_cpc:lt]=1201`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(11)

        response = await client
            .get(`/admin/api/resources/posts?filter[av_cpc:lte]=1200`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(11)

        response = await client
            .get(`/admin/api/resources/posts?filter[av_cpc:gt]=1201`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(15)

        response = await client
            .get(`/admin/api/resources/posts?filter[title:contains]=example`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
        expect(response.body.data[0].title).toContain('example')

        response = await client
            .get(
                `/admin/api/resources/posts?filter[title:equals]=example title`
            )
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
        expect(response.body.data[0].title).toBe('example title')

        response = await client
            .get(
                `/admin/api/resources/posts?filter[title:not_equals]=example title`
            )
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(25)
    })

    test(`${databaseClient} - show only selected fields (posts) `, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        await Promise.all(
            Array.from({ length: 30 }).map(() =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title: lorem.words(3).slice(0, 23),
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user.id
                })
            )
        )

        const client = Supertest(app)

        const response = await client
            .get(
                `/admin/api/resources/posts?perPage=10&page=1&fields=id,title,category`
            )
            .send(userDetails)

        expect(response.status).toBe(200)

        response.body.data.map(d => {
            expect(Object.keys(d)).toHaveLength(3)
            expect(Object.keys(d).sort()).toEqual(['id', 'title', 'category'].sort())
        })
    })

    test(`${databaseClient} - can search on searchable fields on resource (posts) `, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        const titles = ['new title 1', 'new title 2']

        await Promise.all(
            titles.map(title =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title,
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user.id
                })
            )
        )

        const client = Supertest(app)

        let response = await client
            .get(
                `/admin/api/resources/posts?perPage=10&page=1&search=new title 1`
            )
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
        expect(response.body.data[0].title).toBe(titles[0])

        response = await client
            .get(
                `/admin/api/resources/posts?perPage=10&page=1&search=new title 2`
            )
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
        expect(response.body.data[0].title).toBe(titles[1])

        response = await client
            .get(
                `/admin/api/resources/posts?perPage=10&page=1&search=new title`
            )
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(2)

        expect(response.body.data.map(post => post.title).sort()).toEqual(titles)
    })

    test(`${databaseClient} - find all related resources (posts) `, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const [user1, user2] = await Promise.all(
            [Faker.internet.exampleEmail(), Faker.internet.exampleEmail()].map(
                email =>
                    manager({} as any)('User').create({
                        ...userDetails,
                        email
                    })
            )
        )

        await Promise.all(
            Array.from({ length: 3 }).map(() =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title: lorem.words(3).slice(0, 23),
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user1.id
                })
            )
        )

        await Promise.all(
            Array.from({ length: 4 }).map(() =>
                manager({} as any)('Post').create({
                    ...postBuilder(),
                    title: lorem.words(3).slice(0, 23),
                    [databaseClient === 'mongodb' ? 'user' : 'user_id']: user2.id
                })
            )
        )

        const client = Supertest(app)

        // this is to test for the first user

        let response = await client
            .get(`/admin/api/resources/users/${user1.id}/posts`)
            .send({ ...userDetails, email: user1.email })

        expect(response.status).toBe(200)
        expect(response.body.total.toString()).toBe((3).toString())

        response.body.data.forEach((post) => {
            expect((post[databaseClient === 'mongodb' ? 'user' : 'user_id']).toString()).toBe(user1.id.toString())
        })

        // this is to test for the second user

        response = await client
            .get(`/admin/api/resources/users/${user2.id}/posts`)
            .send({ ...userDetails, email: user2.email })

        expect(response.status).toBe(200)
        expect(response.body.total.toString()).toBe((4).toString())

        response.body.data.forEach((post) => {
            expect((post[databaseClient === 'mongodb' ? 'user' : 'user_id']).toString()).toBe(user2.id.toString())
        })
    })

    test(`${databaseClient} - throws error when related resource is not found (posts) `, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        const client = Supertest(app)

        const wrongResource = 'pictures'

        let response = await client
            .get(`/admin/api/resources/users/${user.id}/${wrongResource}`)
            .send(userDetails)

        expect(response.status).toBe(404)
        expect(response.body.message).toEqual(
            `Resource ${wrongResource} not found.`
        )
    })

    test(`${databaseClient} - throws error when related resource has no relation with resource (posts) `, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        const client = Supertest(app)

        const noRelationResource = 'Reaction'

        let response = await client
            .get(`/admin/api/resources/users/${user.id}/reactions`)
            .send(userDetails)

        expect(response.status).toBe(400)
        expect(response.body.message).toEqual(
            `Related field not found between User and ${noRelationResource}.`
        )
    })

    test(`${databaseClient} - throw error when getting a single resource is not found (user)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users']
            } as any,
            databaseClient
        })

        const client = Supertest(app)

        const id = databaseClient === 'mongodb' ? Mongoose.Types.ObjectId() : '123'

        const response = await client
            .get(`/admin/api/resources/users/${id}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toEqual(
            `Could not find a resource with id ${id}`
        )
    })
})

afterAll(async () => {
    await cleanup()
})
