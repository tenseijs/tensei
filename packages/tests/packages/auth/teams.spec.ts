import Jwt from 'jsonwebtoken'
import Supertest from 'supertest'
import { fakeUser, setupTeams } from './setup'

test('the currentTeam method returns the users current team', async () => {
  const customerStud = fakeUser()

  const {
    ctx: { db },
    app
  } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  expect(response.body.data.customer.current_team).toMatchObject({
    id: expect.anything(),
    name: 'Personal'
  })

  const orm: any = db

  const registeredCustomer = await orm.customers.findOne({
    email: customerStud.email
  })

  expect(registeredCustomer.currentTeam()).toMatchObject({
    id: response.body.data.customer.current_team.id
  })
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

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  const permissionsResponse = await client
    .get('/api/teams/permissions')
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const currentTeamId = response.body.data.customer.current_team.id

  await client.post('/api/register').send({
    email: secondCustomerStud.email,
    password: secondCustomerStud.password
  })

  await client.post('/api/register').send({
    email: thirdCustomerStud.email,
    password: thirdCustomerStud.password
  })

  await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({
      email: secondCustomerStud.email,
      permissions: [permissionsResponse.body.data.reverse()[0].slug]
    })
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const firstCustomer = await db.customers.findOne({
    email: customerStud.email
  })

  const team = firstCustomer.current_team

  const secondCustomer = await db.customers.findOne({
    email: secondCustomerStud.email
  })

  const thirdCustomer = await db.customers.findOne({
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
    [
      'attach:databases',
      'manage:teams',
      'create:databases',
      'create:servers'
    ].sort()
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
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const currentTeamId = response.body.data.customer.current_team.id

  await client.post('/api/register').send({
    email: secondCustomerStud.email,
    password: secondCustomerStud.password
  })

  const inviteResponse = await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({
      email: secondCustomerStud.email,
      permissions: [permissionsResponse.body.data.reverse()[0].slug]
    })
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  expect(inviteResponse.status).toBe(204)

  const teamsResponse = await client
    .get(`/api/teams/${currentTeamId}/memberships`)
    .send({})
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  expect(teamsResponse.body.data[0].customer.email).toBe(
    secondCustomerStud.email
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
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const currentTeamId = response.body.data.customer.current_team.id

  const inviteResponse = await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({
      email: secondCustomerStud.email,
      permissions: [permissionsResponse.body.data.reverse()[0].slug]
    })
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  expect(inviteResponse.status).toBe(422)
  expect(inviteResponse.body.message).toBe(`The invited user does not exist.`)
})

test('can get allTeams a user is a member of and owns', async () => {
  process.env.JWT_SECRET = 'jwt-secret'

  const customerStud = fakeUser()
  const secondCustomerStud = fakeUser()

  const { app } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  const currentTeamId = response.body.data.customer.current_team.id

  await client
    .patch(`/api/teams/${currentTeamId}`)
    .send({
      name: 'customer-1-team'
    })
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

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
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const secondCustomerTeamsResponse = await client
    .get(`/api/teams`)
    .set(
      'Authorization',
      `Bearer ${secondCustomerRegisterResponse.body.data.access_token}`
    )

  const teams = secondCustomerTeamsResponse.body.data

  const customerPersonalTeam = teams.find(
    (team: any) => team.name === 'customer-1-team'
  )

  expect(secondCustomerTeamsResponse.status).toBe(200)
  expect(customerPersonalTeam).toBeDefined()
})
