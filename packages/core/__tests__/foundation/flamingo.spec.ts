import Path from 'path'
import Supertest from 'supertest'
import { tool } from '@flamingo/common'

import { setup } from '../helpers'

test('can configure custom dashboard path', async () => {
    const CUSTOM_DASHBOARD_PATH = 'custom-dashboard-path'

    const instance = await setup({
        dashboardPath: CUSTOM_DASHBOARD_PATH
    }, true)

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

    const { app } = await setup({
        apiPath: CUSTOM_API_PATH
    }, true)

    const client = Supertest(app)

    expect((await client.post(`/${CUSTOM_API_PATH}/login`)).status).not.toBe(
        404
    )
    expect((await client.post(`/${CUSTOM_API_PATH}/register`)).status).not.toBe(
        404
    )
})

test('cannot register dashboard after it has been registered', async () => {
    const instance = await setup({})

    const spy = jest.spyOn(instance, 'registerDatabase')

    await instance.register()

    expect(spy).toHaveBeenCalledTimes(0)
})

test('tools can correctly register custom stylesheets and scripts before middleware are setup', async () => {
    const { app } = await setup({
        tools: [
            tool('Graphql').beforeMiddlewareSetup(async ({ style, script }) => {
                script(
                    'graphql.js',
                    Path.resolve(__dirname, '..', 'helpers', 'assets', 'app.js')
                )
                style(
                    'graphql.css',
                    Path.resolve(
                        __dirname,
                        '..',
                        'helpers',
                        'assets',
                        'app.css'
                    )
                )
            }),
        ]
    }, true)

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

test('tools can correctly customise the express application with new routes', async () => {
    const TEST_GRAPHQL_MESSAGE = 'TEST_GRAPHQL_MESSAGE'

    const { app } = await setup({
        tools: [tool('Graphql').setup(async ({ app }) => {
            app.post('/graphql', (req, res) =>
                res.status(212).json({
                    message: TEST_GRAPHQL_MESSAGE,
                })
            )
        })]
    }, true)

    const client = Supertest(app)

    const response = await client.post(`/graphql`)

    expect(response.status).toBe(212)
    expect(response.body.message).toBe(TEST_GRAPHQL_MESSAGE)
})
