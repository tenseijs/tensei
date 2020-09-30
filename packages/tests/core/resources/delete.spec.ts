import Faker, { lorem } from 'faker'
import Supertest from 'supertest'

import { setup, fakePostData } from '../../helpers'

beforeEach(() => {
    jest.clearAllMocks()
})
;['sqlite3', 'mysql', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - can delete resource by ID (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['delete:posts']
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

        const [post1, _] = await Promise.all(
            Array.from({ length: 2 }).map(() =>
                manager({} as any)('Post').create({
                    ...fakePostData(),
                    title: lorem.words(3).slice(0, 23),
                    user_id: user.id
                })
            )
        )

        const client = Supertest(app)

        let response = await client
            .delete(`/admin/api/resources/posts/${post1.toJSON().id}`)
            .send(userDetails)

        expect(response.status).toBe(204)

        response = await client
            .get(`/admin/api/resources/posts`)
            .send(userDetails)

        expect(response.status).toBe(200)
        expect(response.body.total).toBe(1)
    })
    test(`${databaseClient} - throws error when resource ID is not found (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['delete:posts']
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
            Array.from({ length: 2 }).map(() =>
                manager({} as any)('Post').create({
                    ...fakePostData(),
                    title: lorem.words(3).slice(0, 23),
                    user_id: user.id
                })
            )
        )

        const client = Supertest(app)

        const response = await client
            .delete(`/admin/api/resources/posts/21`)
            .send(userDetails)

        expect(response.status).toBe(422)
        expect(response.body.message).toBe('Validation failed.')
        expect(response.body.errors).toEqual([
            { message: 'Post resource with id 21 was not found.' }
        ])
    })
})
