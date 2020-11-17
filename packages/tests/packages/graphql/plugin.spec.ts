import Supertest from 'supertest'
import { setup, fakeTag, sortArrayById, fakePost, fakeUser } from './setup'

let gql = (t: any) => t.toString()

test('correctly generates insert_resource resolvers for all registered resources', async () => {
    const instance = await setup()

    const client = Supertest(instance.app)

    const tag = fakeTag()

    const response = await client.post('/graphql').send({
        query: gql`
            mutation insert_tag($name: String!, $description: String!) {
                insert_tag(object: { name: $name, description: $description }) {
                    id
                    name
                    description
                }
            }
        `,
        variables: tag
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
        data: {
            insert_tag: {
                id: expect.any(String),
                ...tag
            }
        }
    })
})

test('correctly generates insert_resources resolvers for all registered resources', async () => {
    const instance = await setup()

    const client = Supertest(instance.app)

    const [tag, tag2] = [fakeTag(), fakeTag()]

    const response = await client.post('/graphql').send({
        query: gql`
            mutation insert_tags(
                $name: String!
                $description: String!
                $name2: String!
                $description2: String!
            ) {
                insert_tags(
                    objects: [
                        { name: $name, description: $description }
                        { name: $name2, description: $description2 }
                    ]
                ) {
                    id
                    name
                    description
                }
            }
        `,
        variables: {
            ...tag,
            name2: tag2.name,
            description2: tag2.description
        }
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
        data: {
            insert_tags: [
                {
                    id: expect.any(String),
                    ...tag
                },
                {
                    id: expect.any(String),
                    ...tag2
                }
            ]
        }
    })
})

test('correctly generates update_resource resolvers for all registered resources', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    let [tag, updateTag] = [fakeTag(), fakeTag()].map(t =>
        orm.em.create('Tag', t)
    )

    await orm.em.persistAndFlush([tag])

    const response = await client.post('/graphql').send({
        query: gql`
            mutation update_tag(
                $name: String!
                $description: String!
                $tagId: ID!
            ) {
                update_tag(
                    id: $tagId
                    object: { name: $name, description: $description }
                ) {
                    id
                    name
                    description
                }
            }
        `,
        variables: {
            tagId: tag.id,
            name: updateTag.name,
            description: updateTag.description
        }
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
        data: {
            update_tag: {
                id: tag.id?.toString(),
                name: updateTag.name,
                description: updateTag.description
            }
        }
    })
})

test('correctly generates update_resources resolvers for all registered resources', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    let [tag, tag2, updateTag] = [fakeTag(), fakeTag(), fakeTag()].map(t =>
        orm.em.create('Tag', t)
    )

    await orm.em.persistAndFlush([tag, tag2])

    const response = await client.post('/graphql').send({
        query: gql`
            mutation update_tags(
                $name: String!
                $description: String!
                $tagName: String!
                $tagName2: String!
            ) {
                update_tags(
                    where: { name: { _in: [$tagName, $tagName2] } }
                    object: { name: $name, description: $description }
                ) {
                    id
                    name
                    description
                }
            }
        `,
        variables: {
            tagName: tag.name,
            tagName2: tag2.name,
            name: updateTag.name,
            description: updateTag.description
        }
    })

    expect(response.status).toBe(200)
    expect(sortArrayById(response.body.data.update_tags)).toEqual(
        [
            {
                id: tag.id?.toString(),
                name: updateTag.name,
                description: updateTag.description
            },
            {
                id: tag2.id?.toString(),
                name: updateTag.name,
                description: updateTag.description
            }
        ].sort()
    )
})

test('correctly generates delete_resource resolvers for all registered resources', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    let [tag] = [fakeTag()].map(t => orm.em.create('Tag', t))

    await orm.em.persistAndFlush([tag])

    const response = await client.post('/graphql').send({
        query: gql`
            mutation delete_tag($tagId: ID!) {
                delete_tag(id: $tagId) {
                    id
                    name
                    description
                }
            }
        `,
        variables: {
            tagId: tag.id
        }
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
        data: {
            delete_tag: {
                id: tag.id?.toString(),
                name: tag.name,
                description: tag.description
            }
        }
    })

    expect(await orm.em.find('Tag', {})).toHaveLength(0)
})

test('correctly generates delete_resources resolvers for all registered resources', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    let [tag, tag2] = [fakeTag(), fakeTag()].map(t => orm.em.create('Tag', t))

    await orm.em.persistAndFlush([tag, tag2])

    const response = await client.post('/graphql').send({
        query: gql`
            mutation delete_tags($tagId: ID!, $tagId2: ID!) {
                delete_tags(where: { id: { _in: [$tagId, $tagId2] } }) {
                    id
                    name
                    description
                }
            }
        `,
        variables: {
            tagId: tag.id,
            tagId2: tag2.id
        }
    })

    expect(response.status).toBe(200)
    expect(sortArrayById(response.body.data.delete_tags)).toEqual(
        [
            {
                id: tag.id?.toString(),
                name: tag.name,
                description: tag.description
            },
            {
                id: tag2.id?.toString(),
                name: tag2.name,
                description: tag2.description
            }
        ].sort()
    )

    expect(
        await orm.em.find('Tag', {
            id: {
                $in: [tag.id, tag2.id]
            }
        })
    ).toHaveLength(0)
})

test('correctly generates fetch_resources resolvers for all registered resources', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    const user = orm.em.create('User', fakeUser())

    await orm.em.persistAndFlush(user)

    const posts = [
        fakePost(),
        fakePost(),
        fakePost(),
        fakePost(),
        fakePost(),
        fakePost()
    ].map(p =>
        orm.em.create('Post', {
            ...p,
            user: user.id
        })
    )

    await orm.em.persistAndFlush(posts)

    let [tag, tag2] = [fakeTag(), fakeTag()].map(t =>
        orm.em.create('Tag', {
            ...t,
            posts: posts.map(p => p.id)
        })
    )

    await orm.em.persistAndFlush([tag, tag2])

    const response = await client.post('/graphql').send({
        query: gql`
            query tags {
                tags {
                    id
                    name
                    description
                    posts__count
                    posts {
                        id
                        title
                        tags__count
                        description
                        tags {
                            id
                            name
                            description
                        }
                        user {
                            id
                            full_name
                            posts__count
                            posts(offset: 0, limit: 1) {
                                id
                                tags__count
                            }
                        }
                    }
                }
            }
        `
    })

    expect(response.status).toBe(200)
    expect(response.body.data.tags).toHaveLength(2)
    expect(response.body.data.tags[0].name).toBe(tag.name)
    expect(response.body.data.tags[0].description).toBe(tag.description)
    expect(response.body.data.tags[0].posts__count).toBe(6)
    expect(response.body.data.tags[0].posts).toHaveLength(6)

    expect(response.body.data.tags[1].name).toBe(tag2.name)
    expect(response.body.data.tags[1].description).toBe(tag2.description)
    expect(response.body.data.tags[1].posts__count).toBe(6)
    expect(response.body.data.tags[1].posts).toHaveLength(6)

    expect(
        (sortArrayById(response.body.data.tags[0].posts) as any)[0].name
    ).toBe((posts[0] as any).name)
    expect(
        (sortArrayById(response.body.data.tags[0].posts) as any)[0].description
    ).toBe((posts[0] as any).description)

    expect(
        (sortArrayById(response.body.data.tags[1].posts) as any)[0].name
    ).toBe((posts[0] as any).name)
    expect(
        (sortArrayById(response.body.data.tags[1].posts) as any)[0].description
    ).toBe((posts[0] as any).description)

    expect(
        (sortArrayById(response.body.data.tags[0].posts) as any)[0].user
            .posts__count
    ).toBe(posts.length)
    expect(
        (sortArrayById(response.body.data.tags[0].posts) as any)[0].user.posts
            .length
    ).toBe(1)
    expect(
        (sortArrayById(response.body.data.tags[0].posts) as any)[0].user
            .posts[0].tags__count
    ).toBe(2)

    expect(
        (sortArrayById(response.body.data.tags[1].posts) as any)[0].user
            .posts__count
    ).toBe(posts.length)
    expect(
        (sortArrayById(response.body.data.tags[1].posts) as any)[0].user.posts
            .length
    ).toBe(1)
})

test('correctly generates fetch_resource resolvers for all registered resources', async () => {
    const {
        app,
        ctx: { orm }
    } = await setup()

    const client = Supertest(app)

    const user = orm.em.create('User', fakeUser())

    await orm.em.persistAndFlush(user)

    const posts = [
        fakePost(),
        fakePost(),
        fakePost(),
        fakePost(),
        fakePost(),
        fakePost()
    ].map(p =>
        orm.em.create('Post', {
            ...p,
            user: user.id
        })
    )

    await orm.em.persistAndFlush(posts)

    let [tag] = [fakeTag()].map(t =>
        orm.em.create('Tag', {
            ...t,
            posts: posts.map(p => p.id)
        })
    )

    await orm.em.persistAndFlush([tag])

    const response = await client.post('/graphql').send({
        query: gql`
            query tag($tagId: ID!) {
                tag(id: $tagId) {
                    id
                    name
                    description
                    posts__count
                    posts {
                        id
                        title
                        tags__count
                        description
                        tags {
                            id
                            name
                            description
                        }
                        user {
                            id
                            full_name
                            posts__count
                            posts(offset: 0, limit: 1) {
                                id
                                tags__count
                            }
                        }
                    }
                }
            }
        `,
        variables: {
            tagId: tag.id
        }
    })

    expect(response.status).toBe(200)
    expect(response.body.data.tag.name).toBe(tag.name)
    expect(response.body.data.tag.description).toBe(tag.description)
    expect(response.body.data.tag.posts__count).toBe(6)
    expect(response.body.data.tag.posts).toHaveLength(6)

    expect((sortArrayById(response.body.data.tag.posts) as any)[0].name).toBe(
        (posts[0] as any).name
    )
    expect(
        (sortArrayById(response.body.data.tag.posts) as any)[0].description
    ).toBe((posts[0] as any).description)

    expect(
        (sortArrayById(response.body.data.tag.posts) as any)[0].user
            .posts__count
    ).toBe(posts.length)
    expect(
        (sortArrayById(response.body.data.tag.posts) as any)[0].user.posts
            .length
    ).toBe(1)
    expect(
        (sortArrayById(response.body.data.tag.posts) as any)[0].user.posts[0]
            .tags__count
    ).toBe(1)
})
