import Faker, { fake, lorem } from 'faker'
import Supertest from 'supertest'

import { setup, fakePostData } from '../../helpers'
;['sqlite3', 'mysql', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - paginates resources appropriately (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:users', 'fetch:users', 'fetch:posts', 'create:posts']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = (
            await manager({} as any)('User').create(userDetails)
        ).toJSON()

        await Promise.all(
            Array.from({ length: 30 }).map(() =>
                manager({} as any)('Post').create({
                    ...fakePostData(),
                    title: lorem.words(3).slice(0, 23),
                    user_id: user.id
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

        const user = (
            await manager({} as any)('User').create(userDetails)
        ).toJSON()

        await Promise.all(
            Array.from({ length: 30 }).map(() =>
                manager({} as any)('Post').create({
                    ...fakePostData(),
                    title: lorem.words(3).slice(0, 23),
                    user_id: user.id
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
            expect(Object.keys(d)).toEqual(['id', 'title', 'category'])
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

        const user = (
            await manager({} as any)('User').create(userDetails)
        ).toJSON()

        const titles = ['new title 1', 'new title 2']

        await Promise.all(
            titles.map(title =>
                manager({} as any)('Post').create({
                    ...fakePostData(),
                    title,
                    user_id: user.id
                })
            )
        )

        const client = Supertest(app)

        let response = await client
            .get(`/admin/api/resources/posts?perPage=10&page=1&search=new title 1`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
        expect(response.body.data[0].title).toBe(titles[0])

        response = await client
            .get(`/admin/api/resources/posts?perPage=10&page=1&search=new title 2`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
        expect(response.body.data[0].title).toBe(titles[1])

        response = await client
            .get(`/admin/api/resources/posts?perPage=10&page=1&search=new title`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(2)

        response.body.data.map((d: { title: string }, i: number) => {
            expect(d.title).toBe(titles[i])
        })
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
                    ...fakePostData(),
                    title: lorem.words(3).slice(0, 23),
                    user_id: user1.toJSON().id
                })
            )
        )

        await Promise.all(
            Array.from({ length: 4 }).map(() =>
                manager({} as any)('Post').create({
                    ...fakePostData(),
                    title: lorem.words(3).slice(0, 23),
                    user_id: user2.toJSON().id
                })
            )
        )

        const client = Supertest(app)

        // this is to test for the first user

        let response = await client
            .get(`/admin/api/resources/users/1/posts`)
            .send({ ...userDetails, email: user1.toJSON().email })

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(3)

        response.body.data.map((d: { user_id: number }) => {
            expect(d.user_id).toBe(1)
        })

        // this is to test for the second user

        response = await client
            .get(`/admin/api/resources/users/2/posts`)
            .send({ ...userDetails, email: user2.toJSON().email })

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(4)

        response.body.data.map((d: { user_id: number }) => {
            expect(d.user_id).toBe(2)
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

        await manager({} as any)('User').create(userDetails)

        const client = Supertest(app)

        const wrongResource = 'pictures'

        let response = await client
            .get(`/admin/api/resources/users/1/${wrongResource}`)
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

        await manager({} as any)('User').create(userDetails)

        const client = Supertest(app)

        const noRelationResource = 'Reaction'

        let response = await client
            .get('/admin/api/resources/users/1/reactions')
            .send(userDetails)

        expect(response.status).toBe(404)
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

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        await await manager({} as any)('User').create(userDetails)

        const client = Supertest(app)

        const response = await client
            .get(`/admin/api/resources/users/10`)
            .send(userDetails)

        expect(response.status).toBe(404)
        expect(response.body.message).toEqual(
            'Could not find a resource with id 10'
        )
    })
    test(`${databaseClient} - throws error when system cannot find resource (user)`, async () => {
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

        const client = Supertest(app)

        const wrongID = 5

        const response = await client
            .get(`/admin/api/resources/users/${wrongID}`)
            .send(userDetails)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe(
            `Could not find a resource with id ${wrongID}`
        )
    })
})
