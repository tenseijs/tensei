import Supertest from 'supertest'
import { setup, fakeUser, fakePost } from './setup'

test('Generates types only for resources not hidden from API', async () => {
    const { app } = await setup()

    const client = Supertest(app)

    const responses = await Promise.all([
        client.post('/api/comments'),
        client.post('/api/reaction-hidden-from-apis')
    ])

    expect(responses.map(r => r.status)).toEqual([422, 404])
})

test('Only resources exposed to API have fetch_resources endpoints', async () => {
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

    const { status: updatePostStatus } = await client
        .patch(`/api/posts/${post.id}`)
        .send({})

    const [
        { status: updateUserStatus },
        { status: updateReactionStatus }
    ] = await Promise.all([
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
