import Supertest from 'supertest'
import { auth } from '@tensei/auth'
import { plugin, event } from '@tensei/common'
import { setup, fakeUser, fakePost, fakeComment } from './setup'

test('Generates types only for resources not hidden from API', async () => {
  const { app } = await setup()

  const client = Supertest(app)

  const responses = await Promise.all([
    client.post('/api/comments'),
    client.post('/api/reaction-hidden-from-apis')
  ])

  expect(responses.map(r => r.status)).toEqual([422, 404])
})

test('Only resources exposed to API have index_resources endpoints', async () => {
  const { app } = await setup()

  const client = Supertest(app)

  const responses = await Promise.all([
    client.get('/api/comments'),
    client.get('/api/reaction-hidden-from-apis')
  ])

  expect(responses.map(r => r.status)).toEqual([200, 404])
})

test('Only resources exposed to DELETE API have delete_resources endpoints', async () => {
  const {
    app,
    ctx: { orm }
  } = await setup()

  const client = Supertest(app)

  const userPayload = fakeUser()

  await orm.em.persistAndFlush(orm.em.create('User', userPayload))

  const user = await orm.em.findOne<{
    id: string
    email: string
  }>('User', { email: userPayload.email })

  const postPayload = fakePost()

  await orm.em.persistAndFlush(
    orm.em.create('Post', {
      ...postPayload,
      user: user.id
    })
  )

  const post = await orm.em.findOne<{
    id: string
    title: string
  }>('Post', { title: postPayload.title })

  const { status: deletePostStatus } = await client.delete(
    `/api/posts/${post.id}`
  )

  await orm.em.removeAndFlush(post)

  const [
    { status: deleteUserStatus, body },
    { status: deleteReactionStatus }
  ] = await Promise.all([
    client.delete(`/api/users/${user.id}`),
    client.delete(`/api/reaction-hidden-from-apis/1`)
  ])

  orm.em.clear()

  expect([deletePostStatus, deleteUserStatus, deleteReactionStatus]).toEqual([
    404,
    200,
    404
  ])
})

test('Only resources exposed to PUT AND PATCH API have update_resources endpoints', async () => {
  const {
    app,
    ctx: { orm }
  } = await setup()

  const client = Supertest(app)

  const userPayload = fakeUser()

  await orm.em.persistAndFlush(orm.em.create('User', userPayload))

  const user = await orm.em.findOne<{
    id: string
    email: string
  }>('User', { email: userPayload.email })

  const postPayload = fakePost()

  await orm.em.persistAndFlush(
    orm.em.create('Post', {
      ...postPayload,
      user: user.id
    })
  )

  const reactionPayload = { like: true }

  await orm.em.persistAndFlush(
    orm.em.create('ReactionHiddenFromApi', reactionPayload)
  )

  const reaction: any = await orm.em.findOne(
    'ReactionHiddenFromApi',
    reactionPayload
  )

  const post = await orm.em.findOne<{
    id: string
    title: string
  }>('Post', { title: postPayload.title })

  const [
    { status: updatePostStatus },
    { status: updateUserStatus },
    { status: updateReactionStatus }
  ] = await Promise.all([
    client.patch(`/api/posts/${post.id}`).send({}),
    client.patch(`/api/users/${user.id}`).send(fakeUser()),
    client
      .patch(`/api/reaction-hidden-from-apis/${reaction.id}`)
      .send({ like: false })
  ])

  orm.em.clear()

  expect([updatePostStatus, updateUserStatus, updateReactionStatus]).toEqual([
    404,
    200,
    404
  ])
})

test('can update a resource with authentication setup', async () => {
  const {
    app,
    ctx: { orm }
  } = await setup([auth().user('Mister').plugin()])

  const client = Supertest(app)

  const commentPayload = fakeComment()

  await orm.em.persistAndFlush(orm.em.create('Comment', commentPayload))

  const comment = await orm.em.findOne<{ id: number; title: string }>(
    'Comment',
    { title: commentPayload.title }
  )

  // Attempt updating without a bearer token
  const response = await client
    .patch(`/api/comments/${comment.id}`)
    .send(fakeComment())

  expect(response.status).toBe(401)
  expect(response.body.message).toBe('Unauthorized.')

  const registerResponse = await client.post('/api/register').send(fakeUser())

  const newComment = fakeComment()

  const authorizedResponse = await client
    .patch(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${registerResponse.body.data.accessToken}`)
    .send(newComment)

  expect(authorizedResponse.status).toBe(200)
  expect(authorizedResponse.body.data.body).toBe(newComment.body)
})

test('canUpdate authorizer on resources authorize requests', async () => {
  const {
    app,
    ctx: { orm }
  } = await setup()

  const client = Supertest(app)

  const resourcePayload = { like: true }

  await orm.em.persistAndFlush(
    orm.em.create('ResourceCanUpdate', resourcePayload)
  )

  const resource: any = await orm.em.findOne(
    'ResourceCanUpdate',
    resourcePayload
  )

  const response = await client
    .patch(`/api/resource-can-updates/${resource.id}`)
    .send({ like: false })

  expect(response.status).toBe(401)
  expect(response.body.message).toBe('Unauthorized.')

  const authorizedResponse = await client
    .patch(`/api/resource-can-updates/${resource.id}`)
    .send({ like: false, canUpdate: true })

  expect(authorizedResponse.status).toBe(200)
  expect(authorizedResponse.body.data.id).toBe(resource.id)
  expect(authorizedResponse.body.data.like).toBe(false)
})

test('emits created event after resource is inserted', async () => {
  const listener = jest.fn()

  const { app } = await setup([
    plugin('Register listeners').register(({ extendEvents }) => {
      extendEvents([
        event('user::created').listen(({ payload }) =>
          listener(payload.toJSON())
        )
      ])
    })
  ])

  const client = Supertest(app)

  const fake_user = fakeUser()

  const response = await client.post('/api/users').send(fake_user)

  expect(response.status).toBe(201)
  expect(response.body.data).toEqual({
    id: expect.anything(),
    fullName: fake_user.fullName,
    password: fake_user.password,
    email: fake_user.email,
    posts: [],
    createdAt: expect.any(String),
    updatedAt: expect.any(String)
  })
  expect(listener).toHaveBeenCalledWith({
    ...response.body.data,
    createdAt: new Date(response.body.data.createdAt),
    updatedAt: new Date(response.body.data.updatedAt)
  })
})

test('emits updated event after resource is updated', async () => {
  const listener = jest.fn()

  const {
    app,
    ctx: { orm }
  } = await setup([
    plugin('Register listeners').register(({ extendEvents }) => {
      extendEvents([
        event('user::updated').listen(({ payload }) =>
          listener(payload.toJSON())
        )
      ])
    })
  ])

  const client = Supertest(app)

  const userPayload = fakeUser()
  const updatedUserPayload = fakeUser()

  await orm.em.persistAndFlush(orm.em.create('User', userPayload))

  const user = await orm.em.findOne<any>('User', { email: userPayload.email })

  const response = await client.patch(`/api/users/${user.id}`).send({
    email: updatedUserPayload.email,
    fullName: updatedUserPayload.fullName
  })

  const expectedPayload: any = {
    fullName: updatedUserPayload.fullName,
    password: user.password,
    email: updatedUserPayload.email
  }

  if (orm.config.get('type') === 'mongo') {
    expectedPayload.posts = []
  }

  expect(response.status).toBe(200)
  expect(response.body.data).toEqual({
    id: expect.anything(),
    ...expectedPayload,
    updatedAt: expect.any(String),
    createdAt: expect.any(String)
  })
  expect(listener).toHaveBeenCalledWith({
    id: response.body.data.id,
    ...expectedPayload,
    updatedAt: new Date(response.body.data.updatedAt),
    createdAt: new Date(response.body.data.createdAt)
  })
})

test('emits deleted event after resource is deleted', async () => {
  const listener = jest.fn()

  const {
    app,
    ctx: { orm }
  } = await setup([
    plugin('Register listeners').register(({ extendEvents }) => {
      extendEvents([
        event('user::deleted').listen(({ payload }) =>
          listener(payload.map(p => p.toJSON()))
        )
      ])
    })
  ])

  const client = Supertest(app)

  const userPayload = fakeUser()
  await orm.em.persistAndFlush(orm.em.create('User', userPayload))

  const user = await orm.em.findOne<any>('User', { email: userPayload.email })

  const response = await client.delete(`/api/users/${user.id}`)

  expect(response.status).toBe(200)
  expect(listener).toHaveBeenCalledWith([
    {
      ...response.body.data,
      createdAt: new Date(response.body.data.createdAt),
      updatedAt: new Date(response.body.data.updatedAt)
    }
  ])
})
