import { cms } from '@tensei/cms'
import SupertestSession from 'supertest-session'
import Supertest, { SuperTest as SI } from 'supertest'
import { setup, fakeUser, setupFakeMailer, getFakeMailer } from './setup'

export const getCmsCsrfToken = async (client: SI<any>): Promise<string> => {
    const response = await client.get(`/cms/api/csrf`)

    return response.headers['set-cookie'][0].split(';')[0].split('=')[1]
}

test('can passwordlessly register a new administrator user', async () => {
    const mailerMock = getFakeMailer()

    const email = fakeUser().email

    const {
        app,
        ctx: {
            orm: { em }
        }
    } = await setup([cms().plugin(), setupFakeMailer(mailerMock)], false)
    await em.nativeDelete('AdminUserSession', {})

    const client = (SupertestSession(app) as unknown) as SI<any>

    const csrf = await getCmsCsrfToken(client)

    // Clear all existing administrators and passwordless tokens.
    await em.nativeDelete('AdminToken', {})
    await em.nativeDelete('AdminUser', {})

    const response = await client
        .post('/cms/api/passwordless/email/register')
        .set('X-XSRF-TOKEN', csrf)
        .send({
            email
        })

    expect(response.status).toBe(204)

    const [{ token }] = await em.find<{
        token: string
    }>('AdminToken', {})

    const loginResponse = await client.get(
        `/cms/api/passwordless/token/${token}`
    )

    expect(loginResponse.status).toBe(302)
    expect(loginResponse.headers['location']).toBe('/cms')

    const session = await em.find<{
        data: string
    }>('AdminUserSession', {})

    const authUser = await em.findOne<{
        id: string,
        email: string
    }>('AdminUser', {
        email
    })

    const sessionData = JSON.parse(session[0].data)
    
    expect(sessionData?.user?.id?.toString()).toBe(authUser.id.toString())
})

test('cannot register another administrator if a super admin already exists', async () => {
    const mailerMock = getFakeMailer()

    const email = fakeUser().email

    const {
        app,
        ctx: {
            orm: { em }
        }
    } = await setup([cms().plugin(), setupFakeMailer(mailerMock)], false)

    const client = (SupertestSession(app) as unknown) as SI<any>

    const csrf = await getCmsCsrfToken(client)

    // Clear all existing administrators and passwordless tokens.
    await em.nativeDelete('AdminToken', {})
    await em.nativeDelete('AdminUser', {})

    await client
        .post('/cms/api/passwordless/email/register')
        .set('X-XSRF-TOKEN', csrf)
        .send({
            email
        })
    // attempt to register an administrator again
    const response = await client
        .post('/cms/api/passwordless/email/register')
        .set('X-XSRF-TOKEN', csrf)
        .send({
            email
        })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Unauthorized.')
})

test('can passwordlessly login an existing administrator user', async () => {
    const mailerMock = getFakeMailer()

    const email = fakeUser().email

    const {
        app,
        ctx: {
            orm: { em }
        }
    } = await setup([cms().plugin(), setupFakeMailer(mailerMock)], false)

    const client = (SupertestSession(app) as unknown) as SI<any>

    const csrf = await getCmsCsrfToken(client)

    // Clear all existing administrators and passwordless tokens.
    await em.nativeDelete('AdminToken', {})
    await em.nativeDelete('AdminUser', {})

    await client
        .post('/cms/api/passwordless/email/register')
        .set('X-XSRF-TOKEN', csrf)
        .send({
            email
        })

    // clear registration token
    await em.nativeDelete('AdminToken', {})

    const response = await client
        .post('/cms/api/passwordless/email/login')
        .set('X-XSRF-TOKEN', csrf)
        .send({
            email
        })

    const [{ token }] = await em.find<{
        token: string
    }>('AdminToken', {})

    const loginResponse = await client.get(
        `/cms/api/passwordless/token/${token}`
    )

    expect(loginResponse.status).toBe(302)
    expect(loginResponse.headers['location']).toBe('/cms')
})

test('redirects user to login when token is invalid or malformed', async () => {
    const mailerMock = getFakeMailer()

    const email = fakeUser().email

    const {
        app,
        ctx: {
            orm: { em }
        }
    } = await setup([cms().plugin(), setupFakeMailer(mailerMock)], false)

    const client = (SupertestSession(app) as unknown) as SI<any>

    const csrf = await getCmsCsrfToken(client)

    // Clear all existing administrators and passwordless tokens.
    await em.nativeDelete('AdminToken', {})
    await em.nativeDelete('AdminUser', {})

    await client
        .post('/cms/api/passwordless/email/register')
        .set('X-XSRF-TOKEN', csrf)
        .send({
            email
        })

    const loginResponse = await client.get(
        `/cms/api/passwordless/token/WRONG_TOKEN`
    )

    expect(loginResponse.status).toBe(302)
    expect(loginResponse.headers['location']).toBe(
        '/cms/auth/login?error=Your%20login%20credentials%20are%20invalid.%20Please%20try%20again.'
    )
})
