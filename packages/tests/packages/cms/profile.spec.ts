import { cms } from '@tensei/cms'
import SupertestSession from 'supertest-session'
import Supertest, { SuperTest as SI } from 'supertest'
import { setup, fakeUser } from './setup'

import { getCmsCsrfToken } from './admin.spec'

test('can change password of an administrator user', async () => {
  const user = fakeUser()

  const {
    app,
    ctx: {
      orm: { em }
    }
  } = await setup([cms().plugin()], false)
  await em.nativeDelete('AdminUserSession', {})

  const passwords = {
    currentPassword: user.password + user.password,
    newPassword: user.password + user.password + user.password
  }

  const client = (SupertestSession(app) as unknown) as SI<any>

  const csrf = await getCmsCsrfToken(client)

  await em.nativeDelete('AdminUser', {})

  const registerResponse = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.currentPassword
    })
  expect(registerResponse.status).toBe(204)

  const loginResponseWithCurrentPassword = await client
    .post('/cms/api/auth/login')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.currentPassword
    })

  expect(loginResponseWithCurrentPassword.status).toBe(204)

  const response = await client
    .post('/cms/api/auth/change-password')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    })

  expect(response.status).toBe(204)

  const loginResponse = await client
    .post('/cms/api/auth/login')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.newPassword
    })

  expect(loginResponse.status).toBe(204)
})

test('cannot change password of an administrator user with invalid payload', async () => {
  const user = fakeUser()

  const {
    app,
    ctx: {
      orm: { em }
    }
  } = await setup([cms().plugin()], false)
  await em.nativeDelete('AdminUserSession', {})

  const passwords = {
    currentPassword: user.password + user.password,
    newPassword: user.password + user.password + user.password
  }

  const client = (SupertestSession(app) as unknown) as SI<any>

  const csrf = await getCmsCsrfToken(client)

  await em.nativeDelete('AdminUser', {})

  const registerResponse = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.currentPassword
    })
  expect(registerResponse.status).toBe(204)

  const response = await client
    .post('/cms/api/auth/change-password')
    .set('X-XSRF-TOKEN', csrf)
    .send({})

  expect(response.status).toBe(422)

  expect(response.body).toEqual({
    errors: [
      {
        message: 'The password is required.',
        validation: 'required',
        field: 'password'
      },
      {
        message: 'The new password is required.',
        validation: 'required',
        field: 'newPassword'
      }
    ]
  })
})

test('cannot change password if not logged in', async () => {
  const user = fakeUser()

  const {
    app,
    ctx: {
      orm: { em }
    }
  } = await setup([cms().plugin()], false)
  await em.nativeDelete('AdminUserSession', {})

  const passwords = {
    currentPassword: user.password + user.password,
    newPassword: user.password + user.password + user.password
  }

  const client = (SupertestSession(app) as unknown) as SI<any>

  const csrf = await getCmsCsrfToken(client)

  await em.nativeDelete('AdminUser', {})

  const registerResponse = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.currentPassword
    })
  expect(registerResponse.status).toBe(204)

  const logoutResponse = await client
    .post('/cms/api/auth/logout')
    .set('X-XSRF-TOKEN', csrf)
    .send({})

  expect(logoutResponse.status).toBe(204)

  const newCsrf = await getCmsCsrfToken(client)

  const changePasswordResponse = await client
    .post('/cms/api/auth/change-password')
    .set('X-XSRF-TOKEN', newCsrf)
    .send({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    })

  expect(changePasswordResponse.status).toBe(400)
  expect(changePasswordResponse.body.message).toBe('Unauthorized.')
})

test('cannot update profile if not logged in', async () => {
  const user = fakeUser()

  const {
    app,
    ctx: {
      orm: { em }
    }
  } = await setup([cms().plugin()], false)
  await em.nativeDelete('AdminUserSession', {})

  const passwords = {
    currentPassword: user.password + user.password,
    newPassword: user.password + user.password + user.password
  }

  const client = (SupertestSession(app) as unknown) as SI<any>

  const csrf = await getCmsCsrfToken(client)

  await em.nativeDelete('AdminUser', {})

  const registerResponse = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.currentPassword
    })
  expect(registerResponse.status).toBe(204)

  const logoutResponse = await client
    .post('/cms/api/auth/logout')
    .set('X-XSRF-TOKEN', csrf)
    .send({})

  expect(logoutResponse.status).toBe(204)

  const newCsrf = await getCmsCsrfToken(client)

  const updateProfileResponse = await client
    .patch('/cms/api/auth/update-profile')
    .set('X-XSRF-TOKEN', newCsrf)
    .send({
      ...user
    })

  expect(updateProfileResponse.status).toBe(400)
  expect(updateProfileResponse.body.message).toBe('Unauthorized.')
})

test('can update admin profile if logged in', async () => {
  const user = fakeUser()
  const newProfile = fakeUser()

  const {
    app,
    ctx: {
      orm: { em }
    }
  } = await setup([cms().plugin()], false)
  await em.nativeDelete('AdminUserSession', {})

  const passwords = {
    currentPassword: user.password + user.password,
    newPassword: user.password + user.password + user.password
  }

  const client = (SupertestSession(app) as unknown) as SI<any>

  const csrf = await getCmsCsrfToken(client)

  await em.nativeDelete('AdminUser', {})

  const registerResponse = await client
    .post('/cms/api/auth/register')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...user,
      password: passwords.currentPassword
    })
  expect(registerResponse.status).toBe(204)

  const updateProfileResponse = await client
    .patch('/cms/api/auth/update-profile')
    .set('X-XSRF-TOKEN', csrf)
    .send({
      ...newProfile
    })

  expect(updateProfileResponse.status).toBe(204)

  const adminUser = await em.findOne<{
    id: string
    email: string
  }>('AdminUser', {
    email: newProfile.email
  })

  expect(adminUser).not.toBeNull()
})
