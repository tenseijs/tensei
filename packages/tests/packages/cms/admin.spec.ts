import { cms } from '@tensei/cms'
import SupertestSession from 'supertest-session'
import Supertest, { SuperTest as SI } from 'supertest'
import { setup, fakeUser, setupFakeMailer, getFakeMailer } from './setup'

export const getCmsCsrfToken = async (client: SI<any>): Promise<string> => {
  const response = await client.get(`/cms/api/csrf`)

  return response.headers['set-cookie'][0].split(';')[0].split('=')[1]
}

test('can register a new administrator user', async () => {
  const mailerMock = getFakeMailer()

  const user = fakeUser()

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
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: user.password + user.password
    })

  expect(response.status).toBe(204)

  const session = await em.find<{
    data: string
  }>('AdminUserSession', {})

  const authUser = await em.findOne<{
    id: string
    email: string
  }>('AdminUser', {
    email: user.email
  })

  const sessionData = JSON.parse(session[0].data).passport
  expect(sessionData?.user?.id?.toString()).toBe(authUser.id.toString())
})

test('cannot register another administrator if a super admin already exists', async () => {
  const mailerMock = getFakeMailer()

  const user = fakeUser()

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

  const firstRegisterResponse = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: user.password + user.password
    })

  expect(firstRegisterResponse.status).toBe(204)
  // attempt to register an administrator again
  const response = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: user.password + user.password
    })

  expect(response.status).toBe(400)
  expect(response.body.message).toBe('Admin user already exists.')
})

test('can login an existing administrator user', async () => {
  const mailerMock = getFakeMailer()

  const user = fakeUser()

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
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: user.password + user.password
    })

  // clear registration token
  await em.nativeDelete('AdminToken', {})

  const response = await client
    .post('/cms/api/auth/login')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: user.password + user.password
    })

  expect(response.status).toBe(204)
})
