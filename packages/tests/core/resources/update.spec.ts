import Faker from 'faker'
import Supertest from 'supertest'

import { setup } from '../../helpers'
import { User } from '../../helpers/resources'

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

        const user = (
            await await manager({} as any)('User').create(userDetails)
        ).toJSON()

        const beforeUpdateHook = jest.spyOn(User.hooks, 'beforeUpdate')

        const client = Supertest(app)

        const response = await client
            .patch(`/api/resources/users/${user.id}`)
            .send(updateDetails)

        expect(response.status).toBe(200)
        expect(beforeUpdateHook).toHaveBeenCalledTimes(1)
    })
})
