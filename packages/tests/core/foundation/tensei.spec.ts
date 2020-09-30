import Path from 'path'
import Supertest from 'supertest'
import { plugin, resource, text } from '@tensei/common'

import { setup, createAdminUser } from '../../helpers'

test('can configure custom dashboard path', async () => {
    const CUSTOM_DASHBOARD_PATH = 'custom-dashboard-path'

    const instance = await setup(
        {
            dashboardPath: CUSTOM_DASHBOARD_PATH
        },
        true
    )

    const client = Supertest(instance.app)

    expect((await client.get(`/${CUSTOM_DASHBOARD_PATH}`)).status).not.toBe(404)
    expect(
        (await client.get(`/${CUSTOM_DASHBOARD_PATH}/auth/login`)).status
    ).not.toBe(404)
    expect(
        (await client.get(`/${CUSTOM_DASHBOARD_PATH}/auth/register`)).status
    ).not.toBe(404)
})

test('can configure custom api path', async () => {
    const CUSTOM_API_PATH = 'custom-api-path'

    const { app } = await setup(
        {
            apiPath: CUSTOM_API_PATH
        },
        true
    )

    const client = Supertest(app)

    expect((await client.post(`/${CUSTOM_API_PATH}/login`)).status).not.toBe(
        404
    )
    expect((await client.post(`/${CUSTOM_API_PATH}/register`)).status).not.toBe(
        404
    )
})

test('cannot register the instance after it has been registered', async () => {
    const instance = await setup({})

    const spy = jest.spyOn(instance, 'registerDatabase')

    await instance.register()

    expect(spy).toHaveBeenCalledTimes(0)
})

test('cannot register database after it has been registered', async () => {
    const instance = await setup({})

    const spy = jest.spyOn(instance.app, 'use')

    await instance.registerDatabase()

    expect(spy).toHaveBeenCalledTimes(0)
})

test('plugins can correctly register custom stylesheets and scripts before middleware are setup', async () => {
    const { app } = await setup(
        {
            plugins: [
                plugin('Graphql').beforeMiddlewareSetup(
                    async ({ style, script }) => {
                        script(
                            'graphql.js',
                            Path.resolve(
                                __dirname,
                                '..',
                                '..',
                                'helpers',
                                'assets',
                                'app.js'
                            )
                        )
                        style(
                            'graphql.css',
                            Path.resolve(
                                __dirname,
                                '..',
                                '..',
                                'helpers',
                                'assets',
                                'app.css'
                            )
                        )
                    }
                )
            ]
        },
        true
    )

    const client = Supertest(app)

    const response = await client.get(`/admin`)

    expect(response.text).toMatch("<script src='/graphql.js'></script>")
    expect(response.text).toMatch(
        '<link media="all" href="/graphql.css" rel="stylesheet" />'
    )

    const js = await client.get('/graphql.js')
    const css = await client.get('/graphql.css')

    expect(js.status).toBe(200)
    expect(css.status).toBe(200)

    expect(js.text).toMatch('TEST_ASSET')
    expect(css.text).toMatch('TEST_ASSET')
})

test('plugins can correctly customise the express application with new routes', async () => {
    const TEST_GRAPHQL_MESSAGE = 'TEST_GRAPHQL_MESSAGE'

    const { app } = await setup(
        {
            plugins: [
                plugin('Graphql').setup(async ({ app }) => {
                    app.post('/graphql', (req, res) =>
                        res.status(212).json({
                            message: TEST_GRAPHQL_MESSAGE
                        })
                    )
                })
            ]
        },
        true
    )

    const client = Supertest(app)

    const response = await client.post(`/graphql`)

    expect(response.status).toBe(212)
    expect(response.body.message).toBe(TEST_GRAPHQL_MESSAGE)
})

test('plugins can push in new resources to the application', async () => {
    const TEST_FIELD_NAME = 'TEST_FIELD_NAME'
    const TEST_RESOURCE_NAME =
        'TEST_RESOURCE_NAME_' +
        Math.floor(Math.random() * (99999999999 - 1)) +
        1

    const { app } = await setup(
        {
            plugins: [
                plugin('Graphql').beforeDatabaseSetup(
                    async ({ pushResource }) => {
                        pushResource(
                            resource(TEST_RESOURCE_NAME).fields([
                                text(TEST_FIELD_NAME)
                            ])
                        )
                    }
                )
            ]
        },
        true
    )

    const client = Supertest(app)

    const { text: responseText } = await client.get('/admin')

    expect(responseText).toMatch(TEST_FIELD_NAME)
    expect(responseText).toMatch(TEST_RESOURCE_NAME)
})

test('the auth middleware passes if the admin is correctly logged in', async () => {
    const { app, databaseClient: knex } = await setup({}, true)

    const client = Supertest(app)

    const user = await createAdminUser(knex)

    const cookie = (
        await client.post('/admin/api/login').send({
            email: user.email,
            password: 'password'
        })
    ).header['set-cookie'][0]
        .split(';')[0]
        .split('=')[1]

    const response = await client
        .post(`/admin/api/logout`)
        .set('Cookie', [`connect.sid=${cookie};`])

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Logout successful.')
})

test('the auth middleware returns a 401 if there is no logged in admin', async () => {
    const { app, databaseClient: knex } = await setup({}, true)

    const client = Supertest(app)

    const response = await client.post(`/api/logout`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Unauthenticated.')
})

test('the set auth middleware returns a 401 if the user does not exist in the database', async () => {
    const { app, databaseClient: knex } = await setup(
        {
            plugin: [
                plugin('').beforeDatabaseSetup(async ({ app }) => {
                    app.use((request, response, next) => {
                        // @ts-ignore
                        request.session = {
                            user: 3094892829
                        } as any

                        next()
                    })
                })
            ]
        } as any,
        true
    )

    const client = Supertest(app)

    const response = await client.post(`/api/logout`)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('Unauthenticated.')
})
