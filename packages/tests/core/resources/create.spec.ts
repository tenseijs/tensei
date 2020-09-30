import Faker from 'faker'
import Supertest from 'supertest'

import { setup, fakePostData } from '../../helpers'
import { Post } from '../../helpers/resources'

beforeEach(() => {
    jest.clearAllMocks()
})
;['sqlite3', 'mysql', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - calls before create hook during creation (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:posts']
            } as any,
            databaseClient
        })

        const user = (
            await manager({} as any)('User').create({
                email: Faker.internet.exampleEmail(),
                full_name: Faker.name.findName(),
                password: 'password'
            })
        ).toJSON()

        const post = {
            ...fakePostData(),
            user_id: user.id
        }
        const beforeCreateHook = jest.spyOn(Post.hooks, 'beforeCreate')

        const client = Supertest(app)

        const response = await client
            .post(`/admin/api/resources/posts`)
            .send(post)

        expect(beforeCreateHook).toHaveBeenCalledTimes(1)

        expect(response.status).toBe(201)
    })
    test(`${databaseClient} - cannot create another resource with unique constraint (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:posts']
            } as any
        })

        const user = (
            await manager({} as any)('User').create({
                email: Faker.internet.exampleEmail(),
                full_name: Faker.name.findName(),
                password: 'password'
            })
        ).toJSON()

        const post = {
            ...fakePostData(),
            title: 'A new post',
            user_id: user.id
        }

        const client = Supertest(app)

        let response = await client
            .post(`/admin/api/resources/posts`)
            .send(post)

        expect(response.status).toBe(201)

        response = await client.post(`/admin/api/resources/posts`).send(post)

        expect(response.status).toBe(422)
        expect(response.body.message).toBe('Validation failed.')
        expect(response.body.errors).toEqual([
            {
                message: 'A post already exists with title A new post.',
                field: 'title'
            }
        ])
    })
    test(`${databaseClient} - cannot create resource if required field is null (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:posts']
            } as any
        })

        const user = (
            await manager({} as any)('User').create({
                email: Faker.internet.exampleEmail(),
                full_name: Faker.name.findName(),
                password: 'password'
            })
        ).toJSON()

        const post = {
            ...fakePostData(),
            title: 'A new post',
            description: null,
            user_id: user.id
        }

        const client = Supertest(app)

        let response = await client
            .post(`/admin/api/resources/posts`)
            .send(post)

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

    test(`${databaseClient} - cannot create resource if creation rule is violated (posts)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['create:posts']
            } as any
        })

        const user = (
            await manager({} as any)('User').create({
                email: Faker.internet.exampleEmail(),
                full_name: Faker.name.findName(),
                password: 'password'
            })
        ).toJSON()

        const post = {
            ...fakePostData(),
            title: 'A new post',
            content: Faker.lorem.sentence(10000),
            user_id: user.id
        }

        const client = Supertest(app)

        let response = await client
            .post(`/admin/api/resources/posts`)
            .send(post)

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
})
