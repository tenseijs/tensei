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
    id: expect.any(String),
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

test('the allTeams method returns all the teams a user is a member of, including those she owns', async () => {
  const customerStud = fakeUser()
  const secondCustomerStud = fakeUser()

  const {
    ctx: { db },
    app
  } = await setupTeams()

  const client = Supertest(app)

  await Promise.all([
    client.post('/api/register').send({
      email: customerStud.email,
      password: customerStud.password
    }),
    client.post('/api/register').send({
      email: secondCustomerStud.email,
      password: secondCustomerStud.password
    })
  ])
})
