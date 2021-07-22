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
    name: 'Personal',
    role: 'owner'
  })

  const orm: any = db

  const registeredCustomer = await orm.customers.findOne({
    email: customerStud.email
  })

  expect(registeredCustomer.currentTeam()).toMatchObject({
    id: response.body.data.customer.current_team.id
  })
})

test('can get team invite token', async () => {
  process.env.JWT_SECRET = 'jwt-secret'

  const customerStud = fakeUser()

  const { app } = await setupTeams()

  const client = Supertest(app)

  const response = await client.post('/api/register').send({
    email: customerStud.email,
    password: customerStud.password
  })

  const currentTeamId = response.body.data.customer.current_team.id

  const inviteResponse = await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({})
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  expect(inviteResponse.status).toBe(200)

  const inviteToken = inviteResponse.body.data.inviteToken

  const tokenPayload = Jwt.decode(inviteToken, {
    json: true
  })

  expect(tokenPayload).toMatchObject({
    teamId: currentTeamId
  })
})

test('can accept team invite', async () => {
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

  const inviteResponse = await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({})
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const secondCustomerRegisterResponse = await client
    .post('/api/register')
    .send({
      email: secondCustomerStud.email,
      password: secondCustomerStud.password
    })

  const acceptInviteResponse = await client
    .post(`/api/teams/invites/${inviteResponse.body.data.inviteToken}/accept`)
    .send({})
    .set(
      'Authorization',
      `Bearer ${secondCustomerRegisterResponse.body.data.access_token}`
    )

  expect(acceptInviteResponse.status).toBe(204)

  const teamsResponse = await client
    .get(`/api/teams/${currentTeamId}?populate=members.customer`)
    .send({})
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  expect(teamsResponse.body.data.members[0].customer.email).toBe(
    secondCustomerStud.email
  )
})

test('cannot accept team invite with invalid token', async () => {
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

  client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({})
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const secondCustomerRegisterResponse = await client
    .post('/api/register')
    .send({
      email: secondCustomerStud.email,
      password: secondCustomerStud.password
    })

  const acceptInviteResponse = await client
    .post(`/api/teams/invites/INVALID_INVITE_TOKEN/accept`)
    .send({})
    .set(
      'Authorization',
      `Bearer ${secondCustomerRegisterResponse.body.data.access_token}`
    )

  expect(acceptInviteResponse.status).toBe(422)
  expect(acceptInviteResponse.body.errors[0].message).toBe(
    'Invalid invite token.'
  )
})

test('must be authenticated to accept team invite', async () => {
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

  const inviteResponse = await client
    .post(`/api/teams/${currentTeamId}/invites`)
    .send({})
    .set('Authorization', `Bearer ${response.body.data.access_token}`)

  const secondCustomerRegisterResponse = await client
    .post('/api/register')
    .send({
      email: secondCustomerStud.email,
      password: secondCustomerStud.password
    })

  const acceptInviteResponse = await client
    .post(`/api/teams/invites/${inviteResponse.body.data.inviteToken}/accept`)
    .send({})

  expect(acceptInviteResponse.status).toBe(400)
  expect(acceptInviteResponse.body.message).toBe('Unauthorized.')
})
