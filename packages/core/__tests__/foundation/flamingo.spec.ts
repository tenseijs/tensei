import Path from 'path'
import Supertest from 'supertest'
import { tool } from '@flamingo/common'

import { setup, cleanup } from '../helpers'

test('can configure custom dashboard path', async () => {
    const CUSTOM_DASHBOARD_PATH = 'custom-dashboard-path'

    const instance = await setup((instance) => {
        instance.dashboardPath(CUSTOM_DASHBOARD_PATH)
        return instance
    })

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

    const { app, databaseClient } = await setup((instance) => {
        instance.apiPath(CUSTOM_API_PATH)
        return instance
    })

    const client = Supertest(app)

    expect((await client.post(`/${CUSTOM_API_PATH}/login`)).status).not.toBe(
        404
    )
    expect((await client.post(`/${CUSTOM_API_PATH}/register`)).status).not.toBe(
        404
    )

    cleanup(databaseClient)
})

test('cannot register dashboard after it has been registered', async () => {
    const instance = await setup()

    const spy = jest.spyOn(instance, 'registerDatabase')

    await instance.register()

    expect(spy).toHaveBeenCalledTimes(0)
})

test('tools can correctly register custom stylesheets and scripts', async () => {
    const { app, databaseClient } = await setup((instance) => {
        instance.tools([
            tool('Graphql').setup(async ({ style, script }) => {
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
        ])

        return instance
    })

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

    cleanup(databaseClient)
})

test('tools can correctly customise the express application', async () => {
    const TEST_GRAPHQL_MESSAGE = 'TEST_GRAPHQL_MESSAGE'

    const { app, databaseClient } = await setup((instance) => {
        instance.tools([
            tool('Graphql').setup(async ({ app }) => {
                app.post('/graphql', (req, res) =>
                    res.status(212).json({
                        message: TEST_GRAPHQL_MESSAGE,
                    })
                )
            }),
        ])

        return instance
    })

    const client = Supertest(app)

    const response = await client.post(`/graphql`)

    expect(response.status).toBe(212)
    expect(response.body.message).toBe(TEST_GRAPHQL_MESSAGE)

    cleanup(databaseClient)
})
