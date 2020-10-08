import Faker from 'faker'
import Supertest from 'supertest'

import { User } from '../../helpers/resources'
import { setup, fakePostData, cleanup } from '../../helpers'

beforeEach(() => {
    jest.clearAllMocks()
})
;['sqlite3', 'mysql', 'pg'].forEach((databaseClient: any) => {
    test(`${databaseClient} - calls before update hook during resource update (users)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['update:users']
            } as any,
            databaseClient
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

        const user = await manager({} as any)('User').create(userDetails)

        const beforeUpdateHook = jest.spyOn(User.hooks, 'beforeUpdate')

        const client = Supertest(app)

        const response = await client
            .patch(`/admin/api/resources/users/${user.id}`)
            .send(updateDetails)

        expect(response.status).toBe(200)
        expect(beforeUpdateHook).toHaveBeenCalledTimes(1)
    })
    test(`${databaseClient} - validate payload before reousrce update (users)`, async () => {
        const { app, manager } = await setup({
            admin: {
                permissions: ['update:users']
            } as any,
            databaseClient
        })

        const userDetails = {
            email: Faker.internet.exampleEmail(),
            full_name: Faker.name.findName(),
            password: 'password'
        }

        const user = await manager({} as any)('User').create(userDetails)

        const postDetails = {
            ...fakePostData(),
            title: 'A new post',
            user_id: user.id
        }

        const updateDetails = {
            ...postDetails,
            description: null
        }

        const post = await manager({} as any)('Post').create(postDetails)
        const client = Supertest(app)

        const response = await client
            .patch(`/admin/api/resources/posts/${post.id}`)
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
})

afterAll(async () => {
    await cleanup()
})
