import Supertest from 'supertest'
import { setup, fakeTag, sortArrayById, fakePost, fakeUser, gql } from './setup'

test('generates createResource resolvers for all registered resources', async () => {
  const instance = await setup()

  jest.spyOn(instance.ctx.emitter, 'emit')

  const client = Supertest(instance.app)

  const tag = fakeTag()

  const response = await client.post('/graphql').send({
    query: gql`
      mutation createTag(
        $name: String!
        $priority: Int!
        $description: String!
      ) {
        createTag(
          object: {
            name: $name
            priority: $priority
            description: $description
          }
        ) {
          id
          name
          priority
          description
        }
      }
    `,
    variables: tag
  })

  expect(response.status).toBe(200)
  expect(response.body).toEqual({
    data: {
      createTag: {
        ...tag,
        id: expect.any(String),
        priority: tag.priority.toString()
      }
    }
  })

  // TODO: find a way to expect the exact payload here
  expect(instance.ctx.emitter.emit).toHaveBeenCalledWith(
    'tag::created',
    expect.anything()
  )
})

test('validates all insert queries for a resource', async () => {
  const instance = await setup()

  const client = Supertest(instance.app)

  const tag = fakeTag()

  const response = await client.post('/graphql').send({
    query: gql`
      mutation createTag(
        $name: String!
        $description: String!
        $priority: Int!
      ) {
        createTag(
          object: {
            name: $name
            description: $description
            priority: $priority
          }
        ) {
          id
          name
          priority
          description
        }
      }
    `,
    variables: {
      ...tag,
      priority: 34
    }
  })

  expect(response.status).toBe(200)
  expect(response.body.errors[0].message).toBe('Validation failed.')
  expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT')
  expect(response.body.errors[0].extensions.errors).toEqual([
    {
      message: 'under validation failed on priority',
      validation: 'under',
      field: 'priority'
    }
  ])
})

test('validates all update queries for a resource', async () => {
  const instance = await setup()

  const client = Supertest(instance.app)

  const tagEntity = instance.ctx.orm.em.create('Tag', fakeTag())

  await instance.ctx.orm.em.persistAndFlush(tagEntity)

  const tag: any = await instance.ctx.orm.em.findOne('Tag', {
    name: tagEntity.name,
    description: tagEntity.description
  })

  const response = await client.post('/graphql').send({
    query: gql`
      mutation updateTag(
        $id: ID!
        $name: String!
        $description: String!
        $priority: Int!
      ) {
        updateTag(
          id: $id
          object: {
            name: $name
            description: $description
            priority: $priority
          }
        ) {
          id
          name
          priority
          description
        }
      }
    `,
    variables: {
      ...tag,
      id: tag.id,
      priority: 56
    }
  })

  expect(response.status).toBe(200)
  expect(response.body.errors[0].message).toBe('Validation failed.')
  expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT')
  expect(response.body.errors[0].extensions.errors).toEqual([
    {
      message: 'under validation failed on priority',
      validation: 'under',
      field: 'priority'
    }
  ])
})

test('correctly generates createManyResources resolvers for all registered resources', async () => {
  const instance = await setup()

  const client = Supertest(instance.app)

  const [tag, tag2] = [fakeTag(), fakeTag()]

  const response = await client.post('/graphql').send({
    query: gql`
      mutation createManyTags(
        $name: String!
        $description: String!
        $name2: String!
        $description2: String!
        $priority: Int!
      ) {
        createManyTags(
          objects: [
            { name: $name, description: $description, priority: $priority }
            { name: $name2, description: $description2, priority: $priority }
          ]
        ) {
          id
          name
          priority
          description
        }
      }
    `,
    variables: {
      ...tag,
      id: tag.id,
      name2: tag2.name,
      description2: tag2.description
    }
  })

  expect(response.status).toBe(200)
  expect(response.body).toEqual({
    data: {
      createManyTags: [
        {
          id: expect.any(String),
          ...tag,
          priority: tag.priority.toString()
        },
        {
          id: expect.any(String),
          ...tag2,
          priority: tag2.priority.toString()
        }
      ]
    }
  })
})

test('correctly generates updateResource resolvers for all registered resources', async () => {
  const {
    app,
    ctx: { orm, emitter }
  } = await setup()

  const client = Supertest(app)

  jest.spyOn(emitter, 'emit')

  let [tag, updateTag] = [fakeTag(), fakeTag()].map(t =>
    orm.em.create('Tag', t)
  )

  await orm.em.persistAndFlush([tag])

  const response = await client.post('/graphql').send({
    query: gql`
      mutation updateTag($name: String!, $description: String!, $tagId: ID!) {
        updateTag(
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
      updateTag: {
        id: tag.id?.toString(),
        name: updateTag.name,
        description: updateTag.description
      }
    }
  })

  expect(emitter.emit).toHaveBeenCalledWith('tag::updated', expect.anything())
})

test('correctly generates updateManyResources resolvers for all registered resources', async () => {
  const {
    app,
    ctx: { orm, emitter }
  } = await setup()

  const client = Supertest(app)

  jest.spyOn(emitter, 'emit')

  let [tag, tag2, updateTag] = [fakeTag(), fakeTag(), fakeTag()].map(t =>
    orm.em.create('Tag', t)
  )

  await orm.em.persistAndFlush([tag, tag2])

  const response = await client.post('/graphql').send({
    query: gql`
      mutation updateManyTags(
        $name: String!
        $description: String!
        $tagName: String!
        $tagName2: String!
      ) {
        updateManyTags(
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
  expect(sortArrayById(response.body.data.updateManyTags)).toEqual(
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

  expect(emitter.emit).toHaveBeenCalledWith('tags::updated', expect.anything())
})

test('correctly generates deleteResource resolvers for all registered resources', async () => {
  const {
    app,
    ctx: { orm, emitter }
  } = await setup()

  const client = Supertest(app)

  jest.spyOn(emitter, 'emit')

  let [tag] = [fakeTag()].map(t => orm.em.create('Tag', t))

  await orm.em.persistAndFlush([tag])

  const response = await client.post('/graphql').send({
    query: gql`
      mutation deleteTag($tagId: ID!) {
        deleteTag(id: $tagId) {
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
      deleteTag: {
        id: tag.id?.toString(),
        name: tag.name,
        description: tag.description
      }
    }
  })

  expect(await orm.em.find('Tag', {})).toHaveLength(0)
  expect(emitter.emit).toHaveBeenCalledWith('tag::deleted', expect.anything())
})

test(' generates deleteResources resolvers for all registered resources', async () => {
  const {
    app,
    ctx: { orm, emitter }
  } = await setup()

  const client = Supertest(app)

  jest.spyOn(emitter, 'emit')

  let [tag, tag2] = [fakeTag(), fakeTag()].map(t => orm.em.create('Tag', t))

  await orm.em.persistAndFlush([tag, tag2])

  const response = await client.post('/graphql').send({
    query: gql`
      mutation deleteManyTags($tagId: ID!, $tagId2: ID!) {
        deleteManyTags(where: { id: { _in: [$tagId, $tagId2] } }) {
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
  expect(sortArrayById(response.body.data.deleteManyTags)).toEqual(
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

  expect(emitter.emit).toHaveBeenCalledWith('tags::deleted', expect.anything())
})

test('generates indexResources resolvers for all registered resources', async () => {
  const {
    app,
    ctx: { orm, logger }
  } = await setup()

  const client = Supertest(app)

  const user = orm.em.create('User', fakeUser())

  await orm.em.persistAndFlush(user)

  if (orm.config.get('type') === 'mongo') {
    logger.info(
      `BI DIRECTIONAL MANY TO MANY STILL NEEDS TO BE SUPPORTED VIA MONGODB`
    )

    return
  }

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
          postsCount
          posts {
            id
            title
            tagsCount
            description
            tags {
              id
              name
              description
            }
            user {
              id
              firstName
              lastName
              postsCount
              posts(offset: 0, limit: 1) {
                id
                tagsCount
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
  expect(response.body.data.tags[0].postsCount).toBe(6)
  expect(response.body.data.tags[0].posts).toHaveLength(6)

  expect(response.body.data.tags[1].name).toBe(tag2.name)
  expect(response.body.data.tags[1].description).toBe(tag2.description)
  expect(response.body.data.tags[1].postsCount).toBe(6)
  expect(response.body.data.tags[1].posts).toHaveLength(6)

  expect((sortArrayById(response.body.data.tags[0].posts) as any)[0].name).toBe(
    (posts[0] as any).name
  )
  expect(
    (sortArrayById(response.body.data.tags[0].posts) as any)[0].description
  ).toBe((posts[0] as any).description)

  expect((sortArrayById(response.body.data.tags[1].posts) as any)[0].name).toBe(
    (posts[0] as any).name
  )
  expect(
    (sortArrayById(response.body.data.tags[1].posts) as any)[0].description
  ).toBe((posts[0] as any).description)

  expect(
    (sortArrayById(response.body.data.tags[0].posts) as any)[0].user.postsCount
  ).toBe(posts.length)
  expect(
    (sortArrayById(response.body.data.tags[0].posts) as any)[0].user.posts
      .length
  ).toBe(1)
  expect(
    (sortArrayById(response.body.data.tags[0].posts) as any)[0].user.posts[0]
      .tagsCount
  ).toBe(2)

  expect(
    (sortArrayById(response.body.data.tags[1].posts) as any)[0].user.postsCount
  ).toBe(posts.length)
  expect(
    (sortArrayById(response.body.data.tags[1].posts) as any)[0].user.posts
      .length
  ).toBe(1)
})

test('generates indexResources resolvers for all registered resources', async () => {
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
          postsCount
          posts {
            id
            title
            tagsCount
            description
            tags {
              id
              name
              description
            }
            user {
              id
              firstName
              lastName
              postsCount
              posts(offset: 0, limit: 1) {
                id
                tagsCount
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
  expect(response.body.data.tag.postsCount).toBe(6)
  expect(response.body.data.tag.posts).toHaveLength(6)

  expect((sortArrayById(response.body.data.tag.posts) as any)[0].name).toBe(
    (posts[0] as any).name
  )
  expect(
    (sortArrayById(response.body.data.tag.posts) as any)[0].description
  ).toBe((posts[0] as any).description)

  expect(
    (sortArrayById(response.body.data.tag.posts) as any)[0].user.postsCount
  ).toBe(posts.length)
  expect(
    (sortArrayById(response.body.data.tag.posts) as any)[0].user.posts.length
  ).toBe(1)
  expect(
    (sortArrayById(response.body.data.tag.posts) as any)[0].user.posts[0]
      .tagsCount
  ).toBe(1)
})
