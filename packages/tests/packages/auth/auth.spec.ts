import { setup, gql, fakeUser, setupFakeMailer } from './setup'
import Supertest from 'supertest'
import { auth } from '@tensei/auth'
import { rest } from '@tensei/rest'
import { text } from '@tensei/common'
import { graphql } from '@tensei/graphql'

jest.mock('purest', () => {
  return () => {}
})

test('Registers auth resources when plugin is registered', async () => {
  const {
    ctx: { resources }
  } = await setup([auth().plugin()])

  expect(
    resources.find(resource => resource.data.name === 'User')
  ).toBeDefined()
})

test('Can customize the name of the authenticator user', async () => {
  const {
    ctx: { resources }
  } = await setup([auth().user('Customer').plugin()])

  expect(
    resources.find(resource => resource.data.name === 'Customer')
  ).toBeDefined()
})

test('Enabling roles and permissions registers Role and permission resources', async () => {
  const {
    ctx: { resources }
  } = await setup([auth().rolesAndPermissions().plugin()])

  expect(
    resources.filter(resource =>
      ['Role', 'Permission'].includes(resource.data.name)
    )
  ).toHaveLength(2)
})

test('Can customize role and permission names', async () => {
  const {
    ctx: { resources }
  } = await setup([
    auth().rolesAndPermissions().role('Department').permission('Power').plugin()
  ])

  expect(
    resources.filter(resource =>
      ['Department', 'Power'].includes(resource.data.name)
    )
  ).toHaveLength(2)
})

test('Can add new fields to the user resource using the setup function', async () => {
  const description = 'All departments have this description.'

  const {
    ctx: { orm }
  } = await setup([
    auth()
      .rolesAndPermissions()
      .role('Department')
      .permission('Power')
      .setup(({ role, user }) => {
        user.fields([text('Name')])
        role
          .fields([text('Description').nullable()])
          .beforeCreate(async ({ entity, em }) => {
            em.assign(entity, {
              description
            })
          })
      })
      .plugin()
  ])

  orm.em.create('Department', {
    name: 'Test department',
    slug: 'test-department'
  })

  await orm.em.persistAndFlush(
    orm.em.create('Department', {
      name: 'Test department',
      slug: 'test-department'
    })
  )

  expect(
    ((await orm.em.findOne('Department', {
      slug: 'test-department'
    })) as any).description
  ).toBe(description)
})

test('Can enable email verification for auth', async () => {
  const {
    ctx: {
      orm: { em }
    },
    app
  } = await setup([
    auth()
      .user('Customer')
      .verifyEmails()
      .refreshTokens()
      .setup(({ user }) => {
        user.fields([text('Name').nullable()])
      })
      .plugin(),
    graphql().plugin()
  ])

  const client = Supertest(app)

  const user = fakeUser()

  const response = await client.post(`/graphql`).send({
    query: gql`
      mutation register($name: String!, $email: String!, $password: String!) {
        register(object: { name: $name, email: $email, password: $password }) {
          customer {
            id
            email
            email_verified_at
          }

          access_token
        }
      }
    `,
    variables: {
      name: user.full_name,
      email: user.email,
      password: user.password
    }
  })

  expect(response.status).toBe(200)

  const registeredCustomer: any = await em.findOne('Customer', {
    email: user.email
  })
  expect(response.body.data.register.customer.id).toBe(
    registeredCustomer.id.toString()
  )
  expect(registeredCustomer.email_verification_token).toBeDefined()

  const verify_email_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation confirm_email($email_verification_token: String!) {
          confirm_email(
            object: { email_verification_token: $email_verification_token }
          ) {
            id
            email
            email_verified_at
          }
        }
      `,
      variables: {
        email_verification_token: registeredCustomer.email_verification_token
      }
    })
    .set('Authorization', `Bearer ${response.body.data.register.access_token}`)

  expect(verify_email_response.body.data.confirm_email).toEqual({
    id: registeredCustomer.id.toString(),
    email: registeredCustomer.email,
    email_verified_at: expect.any(String)
  })
})

test('Can request a password reset and reset password', async () => {
  const mailerMock = {
    send: jest.fn(),
    sendRaw: jest.fn()
  }

  const {
    ctx: {
      orm: { em }
    },
    app
  } = await setup([
    auth().verifyEmails().refreshTokens().user('Student').plugin(),
    graphql().plugin(),
    setupFakeMailer(mailerMock)
  ])

  const client = Supertest(app)

  const user = em.create('Student', fakeUser())

  await em.persistAndFlush(user)

  const response = await client.post(`/graphql`).send({
    query: gql`
      mutation request_password_reset($email: String!) {
        request_password_reset(object: { email: $email })
      }
    `,
    variables: {
      email: user.email
    }
  })

  expect(response.body).toEqual({
    data: { request_password_reset: true }
  })

  const passwordReset: any = await em.findOne('PasswordReset', {
    email: user.email
  })

  const UPDATED_PASSWORD = 'UPDATED_PASSWORD'

  expect(passwordReset).not.toBe(null)

  const reset_password_response = await client.post(`/graphql`).send({
    query: gql`
      mutation reset_password(
        $email: String!
        $password: String!
        $token: String!
      ) {
        reset_password(
          object: { email: $email, token: $token, password: $password }
        )
      }
    `,
    variables: {
      email: user.email,
      password: UPDATED_PASSWORD,
      token: passwordReset.token
    }
  })

  expect(reset_password_response.status).toBe(200)
  expect(reset_password_response.body).toEqual({
    data: { reset_password: true }
  })

  const login_response = await client.post(`/graphql`).send({
    query: gql`
      mutation login($email: String!, $password: String!) {
        login(object: { email: $email, password: $password }) {
          student {
            id
            email
          }
        }
      }
    `,
    variables: {
      password: UPDATED_PASSWORD,
      email: user.email
    }
  })

  expect(login_response.status).toBe(200)
  expect(login_response.body.data.login).toEqual({
    student: {
      id: user.id.toString(),
      email: user.email
    }
  })
})

test('access tokens and refresh tokens are generated correctly', async done => {
  const jwtExpiresIn = 2 // in seconds
  const refreshTokenExpiresIn = 4 // in seconds

  const {
    ctx: {
      orm: { em }
    },
    app
  } = await setup([
    auth()
      .verifyEmails()
      .refreshTokens()
      .user('Student')
      .setup(({ user }) => {
        user.fields([text('Name').nullable()])
      })
      .configureTokens({
        accessTokenExpiresIn: jwtExpiresIn,
        refreshTokenExpiresIn
      })
      .plugin(),
    graphql().plugin()
  ])

  const client = Supertest(app)

  const user = em.create('Student', fakeUser())

  await em.persistAndFlush(user)

  const login_response = await client.post(`/graphql`).send({
    query: gql`
      mutation login($email: String!, $password: String!) {
        login(object: { email: $email, password: $password }) {
          access_token
          refresh_token
          student {
            id
            email
          }
        }
      }
    `,
    variables: {
      password: 'password',
      email: user.email
    }
  })

  const accessToken: string = login_response.body.data.login.access_token
  const refreshToken: string = login_response.body.data.login.refresh_token

  setTimeout(async () => {
    // Wait for the jwt to expire, then run a test, make sure its invalid and fails.
    const authenticated_response = await client
      .post(`/graphql`)
      .send({
        query: gql`
          query authenticated {
            authenticated {
              id
              name
              email
            }
          }
        `
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(authenticated_response.body.data).toBeNull()
    expect(authenticated_response.body.errors[0].message).toBe('Unauthorized.')

    // Refresh the jwt with the valid refresh token. Expect to get a new, valid JWT

    const refresh_token_response = await client.post(`/graphql`).send({
      query: gql`
        mutation refresh_token($refresh_token: String!) {
          refresh_token(object: { refresh_token: $refresh_token }) {
            access_token
            refresh_token
            student {
              id
              email
            }
          }
        }
      `,
      variables: {
        refresh_token: refreshToken
      }
    })

    expect(refresh_token_response.body.data.refresh_token).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      student: {
        id: user.id.toString(),
        email: user.email
      }
    })

    // Make a request with the refreshed jwt. Expect it to return a valid authenticated user
    const authenticated_refreshed_response = await client
      .post(`/graphql`)
      .send({
        query: gql`
          query authenticated {
            authenticated {
              id
              name
              email
            }
          }
        `
      })
      .set(
        'Authorization',
        `Bearer ${refresh_token_response.body.data.refresh_token.access_token}`
      )

    expect(authenticated_refreshed_response.body.data.authenticated).toEqual({
      name: null,
      id: user.id.toString(),
      email: user.email
    })
  }, jwtExpiresIn * 1000)

  setTimeout(async () => {
    // After the refresh token has expired, make a call to confirm it can no longer return fresh and new jwts

    const invalid_refresh_token_response = await client.post(`/graphql`).send({
      query: gql`
        mutation refresh_token($refresh_token: String!) {
          refresh_token(object: { refresh_token: $refresh_token }) {
            access_token
            refresh_token
            student {
              id
              email
            }
          }
        }
      `,
      variables: {
        refresh_token: refreshToken
      }
    })

    expect(invalid_refresh_token_response.body.errors[0].message).toBe(
      'Invalid refresh token.'
    )

    done()
  }, refreshTokenExpiresIn * 1000)

  const authenticated_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        query authenticated {
          authenticated {
            id
            name
            email
          }
        }
      `
    })
    .set('Authorization', `Bearer ${accessToken}`)

  const refresh_token_has_no_access_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        query authenticated {
          authenticated {
            id
            name
            email
          }
        }
      `
    })
    .set('Authorization', `Bearer ${refreshToken}`)

  expect(refresh_token_has_no_access_response.body.data).toBeNull()
  expect(refresh_token_has_no_access_response.body.errors[0].message).toBe(
    'Unauthorized.'
  )

  expect(authenticated_response.body.data.authenticated).toEqual({
    name: null,
    id: user.id.toString(),
    email: user.email
  })

  // @ts-ignore
}, 10000)

test('if a refresh token is used twice (compromised), the user is automatically blocked', async () => {
  const {
    ctx: {
      orm: { em }
    },
    app
  } = await setup([
    auth().user('Customer').refreshTokens().plugin(),
    graphql().plugin()
  ])

  const client = Supertest(app)

  const user = em.create('Customer', fakeUser())

  await em.persistAndFlush(user)

  const login_response = await client.post(`/graphql`).send({
    query: gql`
      mutation login($email: String!, $password: String!) {
        login(object: { email: $email, password: $password }) {
          access_token
          refresh_token
          customer {
            id
            email
          }
        }
      }
    `,
    variables: {
      password: 'password',
      email: user.email
    }
  })

  const { refresh_token } = login_response.body.data.login

  const refresh_token_response = await client.post(`/graphql`).send({
    query: gql`
      mutation refresh_token($refresh_token: String!) {
        refresh_token(object: { refresh_token: $refresh_token }) {
          access_token
          refresh_token
          customer {
            email
          }
        }
      }
    `,
    variables: {
      refresh_token
    }
  })

  expect(refresh_token_response.status).toBe(200)
  expect(refresh_token_response.body.data.refresh_token).toEqual({
    access_token: expect.any(String),
    refresh_token: expect.any(String),
    customer: {
      email: expect.any(String)
    }
  })
  const compromised_refresh_token_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation refresh_token($refresh_token: String!) {
          refresh_token(object: { refresh_token: $refresh_token }) {
            access_token
            refresh_token
            customer {
              id
              email
            }
          }
        }
      `,
      variables: {
        refresh_token
      }
    })

  expect(compromised_refresh_token_response.status).toBe(200)
  expect(compromised_refresh_token_response.body.errors[0].message).toBe(
    'Invalid refresh token.'
  )

  const login_response_after_blocked = await client.post(`/graphql`).send({
    query: gql`
      mutation login($email: String!, $password: String!) {
        login(object: { email: $email, password: $password }) {
          access_token
          refresh_token
          customer {
            id
            email
          }
        }
      }
    `,
    variables: {
      password: 'password',
      email: user.email
    }
  })

  expect(login_response_after_blocked.status).toBe(200)
  expect(login_response_after_blocked.body.errors[0].message).toBe(
    'Your account is temporarily disabled.'
  )
})

test('registers new users with email/password based authentication', async () => {
  const { app } = await setup([
    auth().verifyEmails().user('Student').plugin(),
    graphql().plugin()
  ])

  const client = Supertest(app)

  const user = fakeUser()

  const register_response = await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          student {
            id
            email
            email_verified_at
          }
        }
      }
    `,
    variables: {
      email: user.email,
      password: 'password'
    }
  })

  expect(register_response.status).toBe(200)
  expect(register_response.body.data.register.student).toEqual({
    id: expect.any(String),
    email: user.email,
    email_verified_at: null
  })
})

test('authentication works when refresh tokens are disabled', async () => {
  const { app } = await setup([
    auth().verifyEmails().user('Student').plugin(),
    graphql().plugin()
  ])

  const client = Supertest(app)

  const user = fakeUser()

  const register_response = await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          student {
            id
            email
            email_verified_at
          }
        }
      }
    `,
    variables: {
      email: user.email,
      password: 'password'
    }
  })

  expect(register_response.status).toBe(200)

  const login_response = await client.post(`/graphql`).send({
    query: gql`
      mutation login($email: String!, $password: String!) {
        login(object: { email: $email, password: $password }) {
          student {
            id
            email
            email_verified_at
          }
          access_token
        }
      }
    `,
    variables: {
      email: user.email,
      password: 'password'
    }
  })

  expect(login_response.status).toBe(200)
  expect(login_response.body.data.login.student).toEqual({
    id: expect.any(String),
    email: user.email,
    email_verified_at: null
  })
})

test('can signup with social authentication', async () => {
  const githubConfig = {
    key: 'TEST_KEY',
    secret: 'TEST_SECRET'
  }
  const { app, ctx } = await setup([
    auth()
      .verifyEmails()
      .user('Doctor')
      .social('github', githubConfig)
      .plugin(),
    rest().plugin()
  ])

  const client = Supertest(app)

  const getResponse = await client.get('/connect/github')

  expect(getResponse.status).toBe(302)
  expect(getResponse.headers.location).toBe(
    `https://github.com/login/oauth/authorize?client_id=${githubConfig.key}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3Aundefined%2Fconnect%2Fgithub%2Fcallback&scope=user%2Cuser%3Aemail`
  )

  const fakeIdentity = {
    provider: 'github',
    access_token: 'TEST_ACCESS_TOKEN',
    temporal_token: 'TEST_TEMPORAL_TOKEN',
    email: 'test@email.com',
    payload: JSON.stringify({
      email: 'test@email.com'
    }),
    provider_user_id: 'TEST_PROVIDER_USER_ID'
  }

  await ctx.orm.em.persistAndFlush(
    ctx.orm.em.create('OauthIdentity', fakeIdentity)
  )

  const postResponse = await client.post('/api/social/confirm').send({
    access_token: fakeIdentity.temporal_token
  })

  expect(postResponse.status).toBe(200)
  expect(postResponse.body).toMatchObject({
    data: {
      doctor: {
        email: fakeIdentity.email,
        email_verified_at: expect.any(String)
      }
    }
  })
})

test('can verify registered user email', async () => {
  const { app, ctx } = await setup([
    auth().verifyEmails().user('Student').plugin(),
    rest().plugin()
  ])

  const client = Supertest(app)

  const user = fakeUser()

  const registerResponse = await client.post('/api/register').send(user)

  const savedUser = await ctx.orm.em.findOne<{
    email: string
    email_verification_token: string
  }>('Student', {
    email: user.email
  })

  const response = await client
    .post('/api/emails/verification/confirm')
    .send({
      email_verification_token: savedUser.email_verification_token
    })
    .set('Authorization', `Bearer ${registerResponse.body.data.access_token}`)

  expect(response.status).toBe(200)
  expect(response.body.data.email_verified_at).toBeDefined()
})
