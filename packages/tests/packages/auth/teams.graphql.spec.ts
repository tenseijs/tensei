import Supertest from 'supertest'
import { fakeUser, setupTeams, gql } from './setup'

test('the currentTeam method returns the users current team', async () => {
  const customerStud = fakeUser()

  const {
    ctx: { repositories },
    app
  } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          customer {
            id
            email
            currentTeam {
              id
              name
              createdAt
              owner {
                id
                email
              }
            }
          }

          accessToken
        }
      }
    `,
    variables: {
      email: customerStud.email,
      password: customerStud.password
    }
  })

  expect(response.body.data.register.customer.currentTeam).toMatchObject({
    id: expect.anything(),
    name: 'Personal',
    owner: {
      id: expect.anything(),
      email: customerStud.email
    }
  })

  const orm: any = repositories

  const registeredCustomer = await orm.customers().findOne({
    email: customerStud.email
  })

  expect(registeredCustomer.currentTeam.id.toString()).toEqual(
    response.body.data.register.customer.currentTeam.id.toString()
  )
})

test('the hasTeamPermission method checks if a user can perform a specific team permission', async () => {
  process.env.JWT_SECRET = 'jwt-secret'

  const customerStud = fakeUser()
  const secondCustomerStud = fakeUser()
  const thirdCustomerStud = fakeUser()

  const {
    app,
    ctx: { db }
  } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          customer {
            id
            email
            currentTeam {
              id
            }
          }

          accessToken
        }
      }
    `,
    variables: {
      email: customerStud.email,
      password: customerStud.password
    }
  })

  const permissionsResponse = await client
    .get('/api/teams/permissions')
    .set('Authorization', `Bearer ${response.body.data.register.accessToken}`)

  const currentTeamId = response.body.data.register.customer.currentTeam.id

  await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          customer {
            id
            email
          }

          accessToken
        }
      }
    `,
    variables: {
      email: secondCustomerStud.email,
      password: secondCustomerStud.password
    }
  })

  await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          customer {
            id
            email
          }

          accessToken
        }
      }
    `,
    variables: {
      email: thirdCustomerStud.email,
      password: thirdCustomerStud.password
    }
  })

  const inviteMemberResponse = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation inviteTeamMember(
          $teamId: ID!
          $email: String!
          $permissions: [TeamPermissionString]
        ) {
          inviteTeamMember(
            teamId: $teamId
            object: { email: $email, permissions: $permissions }
          )
        }
      `,
      variables: {
        teamId: currentTeamId,
        email: secondCustomerStud.email,
        permissions: [
          permissionsResponse.body.data.reverse()[0].slug
        ].map(slug => slug.split(':').join('_').toUpperCase())
      }
    })
    .set('Authorization', `Bearer ${response.body.data.register.accessToken}`)
  expect(inviteMemberResponse.body.data.inviteTeamMember).toBe(true)

  const firstCustomer = await db.customers().findOne({
    email: customerStud.email
  })

  const team = firstCustomer.currentTeam

  const secondCustomer = await db.customers().findOne({
    email: secondCustomerStud.email
  })

  const thirdCustomer = await db.customers().findOne({
    email: thirdCustomerStud.email
  })

  expect(firstCustomer.ownsTeam(team)).toBe(true)
  expect(secondCustomer.ownsTeam(team)).toBe(false)
  expect(thirdCustomer.ownsTeam(team)).toBe(false)

  expect(await firstCustomer.belongsToTeam(team)).toBe(true)
  expect(await secondCustomer.belongsToTeam(team)).toBe(true)
  expect(await thirdCustomer.belongsToTeam(team)).toBe(false)

  expect(await firstCustomer.hasTeamPermission(team, 'create:databases')).toBe(
    true
  )
  expect(await secondCustomer.hasTeamPermission(team, 'create:databases')).toBe(
    false
  )
  expect(await secondCustomer.hasTeamPermission(team, 'attach:databases')).toBe(
    true
  )
  expect(await thirdCustomer.hasTeamPermission(team, 'create:databases')).toBe(
    false
  )
  expect(await thirdCustomer.hasTeamPermission(team, 'attach:databases')).toBe(
    false
  )

  expect((await firstCustomer.teamPermissions(team)).sort()).toEqual(
    ['attach:databases', 'create:databases', 'create:servers'].sort()
  )
  expect(await secondCustomer.teamPermissions(team)).toEqual([
    'attach:databases'
  ])
  expect(await thirdCustomer.teamPermissions(team)).toEqual([])
})

test('can invite a user to a team', async () => {
  process.env.JWT_SECRET = 'jwt-secret'

  const customerStud = fakeUser()
  const secondCustomerStud = fakeUser()

  const { app } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  const permissionsResponse = await client
    .get('/api/teams/permissions')
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  const currentTeamId = response.body.data.customer.currentTeam.id

  await client.post('/api/register').send({
    email: secondCustomerStud.email,
    password: secondCustomerStud.password
  })

  const inviteResponse = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation inviteTeamMember(
          $teamId: ID!
          $email: String!
          $permissions: [TeamPermissionString]
        ) {
          inviteTeamMember(
            teamId: $teamId
            object: { email: $email, permissions: $permissions }
          )
        }
      `,
      variables: {
        teamId: currentTeamId,
        email: secondCustomerStud.email,
        permissions: [
          permissionsResponse.body.data.reverse()[0].slug
        ].map(slug => slug.split(':').join('_').toUpperCase())
      }
    })
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  expect(inviteResponse.status).toBe(200)

  const teamsResponse = await client
    .post(`/graphql`)
    .send({
      query: gql`
        query teamMemberships($teamId: ID!) {
          teamMemberships(teamId: $teamId) {
            id
            team {
              id
              name
              owner {
                id
                email
              }
            }
            createdAt
            updatedAt
            customer {
              id
              email
              ownTeams {
                id
                name
              }
            }
          }
        }
      `,
      variables: {
        teamId: currentTeamId
      }
    })
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  expect(teamsResponse.body.data.teamMemberships[0].customer.email).toBe(
    secondCustomerStud.email
  )
  expect(teamsResponse.body.data.teamMemberships[0].team.owner.email).toBe(
    customerStud.email
  )
})

test('can only invite an existing user to a team', async () => {
  process.env.JWT_SECRET = 'jwt-secret'

  const customerStud = fakeUser()
  const secondCustomerStud = fakeUser()

  const { app } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  const permissionsResponse = await client
    .get('/api/teams/permissions')
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  const currentTeamId = response.body.data.customer.currentTeam.id

  const inviteResponse = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation inviteTeamMember(
          $teamId: ID!
          $email: String!
          $permissions: [TeamPermissionString]
        ) {
          inviteTeamMember(
            teamId: $teamId
            object: { email: $email, permissions: $permissions }
          )
        }
      `,
      variables: {
        teamId: currentTeamId,
        email: secondCustomerStud.email,
        permissions: [
          permissionsResponse.body.data.reverse()[0].slug
        ].map(slug => slug.split(':').join('_').toUpperCase())
      }
    })
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  expect(inviteResponse.body.errors[0].message).toBe(
    `The invited user does not exist.`
  )
})

test('can get allTeams a user is a member of and owns', async () => {
  process.env.JWT_SECRET = 'jwt-secret'

  const customerStud = fakeUser()
  const secondCustomerStud = fakeUser()

  const { app, ctx } = await setupTeams()

  if (ctx.orm.config.get('type') === 'mongo') {
    console.warn(`MongoDB Population not working correctly for allTeams query.`)
    return
  }

  const client = Supertest(app)

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  const currentTeamId = response.body.data.customer.currentTeam.id

  await client
    .patch(`/api/teams/${currentTeamId}`)
    .send({
      name: 'customer-1-team'
    })
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  const secondCustomerRegisterResponse = await client
    .post('/api/register')
    .send({
      email: secondCustomerStud.email,
      password: secondCustomerStud.password
    })

  await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({
      email: secondCustomerStud.email,
      permissions: ['create:databases']
    })
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  const secondCustomerTeamsResponse = await client
    .post('/graphql')
    .send({
      query: gql`
        query allTeams {
          allTeams {
            id
            name
            owner {
              id
              email
            }
            memberships {
              id
              customer {
                id
                email
              }
            }
          }
        }
      `
    })
    .set(
      'Authorization',
      `Bearer ${secondCustomerRegisterResponse.body.data.accessToken}`
    )

  const customerTeamsResponse = await client
    .post('/graphql')
    .send({
      query: gql`
        query allTeams {
          allTeams {
            id
            name
            owner {
              id
              email
            }
            memberships {
              id
              customer {
                id
                email
              }
            }
          }
        }
      `
    })
    .set('Authorization', `Bearer ${response.body.data.accessToken}`)

  const teams = secondCustomerTeamsResponse.body.data.allTeams
  const customerTeams = customerTeamsResponse.body.data.allTeams

  expect(customerTeams).toHaveLength(1)
  expect(customerTeams[0].memberships[0].customer.email).toBe(
    secondCustomerStud.email
  )

  const customerPersonalTeam = teams.find(
    (team: any) => team.name === 'customer-1-team'
  )

  expect(secondCustomerTeamsResponse.status).toBe(200)
  expect(customerPersonalTeam).toBeDefined()
  expect(customerPersonalTeam.memberships.length).toBe(1)
})
