import Faker, { lorem } from 'faker'
import Supertest from 'supertest'

import { setup, fakePostData } from '../../helpers'
import { Post, User } from '../../helpers/resources'

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
            .delete(`/api/resources/posts/${post1.toJSON().id}`)
            .send(userDetails)

        expect(response.status).toBe(204)

        response = await client.get(`/api/resources/posts`).send(userDetails)

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
            .delete(`/api/resources/posts/21`)
            .send(userDetails)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe(
            'Could not find a resource with id 21'
        )
    })
    test(`${databaseClient} - calls beforeDelete hook (posts)`, async () => {
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

        const post = (
            await manager({} as any)('Post').create({
                ...fakePostData(),
                title: lorem.words(3).slice(0, 23),
                user_id: user.id
            })
        ).toJSON()

        const beforeDeleteHook = jest.spyOn(Post.hooks, 'beforeDelete')

        const client = Supertest(app)

        let response = await client
            .delete(`/api/resources/posts/${post.id}`)
            .send(userDetails)

        expect(response.status).toBe(204)
        expect(beforeDeleteHook).toHaveBeenCalledTimes(1)
    })
    test(`${databaseClient} - cannot delete record when error is thrown in before delete hooks (posts)`, async () => {
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

        await manager({} as any)('User').create(userDetails)

        User.beforeDelete(async (model, request) => {
            throw {
                status: 400,
                message: `cannot delete record`
            }
        })

        const beforeDeleteHook = jest.spyOn(User.hooks, 'beforeDelete')

        const client = Supertest(app)

        let response = await client
            .delete(`/api/resources/users/1`)
            .send(userDetails)

        expect(response.status).toBe(400)
        expect(beforeDeleteHook).toHaveBeenCalledTimes(1)
        expect(response.body.message).toBe('cannot delete record')
    })
})
