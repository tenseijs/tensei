import Supertest from 'supertest'
import { setup, gql } from './setup'

const IntrospectionQuery = gql`
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        description

        fields {
          name
          description
        }

        inputFields {
          name
          description
        }
      }
    }
  }
`

const getSchema = async () => {
  const instance = await setup()

  const client = Supertest(instance.app)

  const response = await client.post('/graphql').send({
    query: IntrospectionQuery,
    operationName: 'IntrospectionQuery'
  })

  return response.body.data.__schema
}

test('Generates types only for resources not hidden from API', async () => {
  const schema = await getSchema()

  expect(schema.types.find(t => t.name === 'CreateTagInput')).toBeDefined()
  expect(schema.types.find(t => t.name === 'UpdateTagInput')).toBeDefined()
  expect(schema.types.find(t => t.name === 'CreateCommentInput')).toBeDefined()
  expect(schema.types.find(t => t.name === 'UpdateCommentInput')).toBeDefined()
  expect(
    schema.types.find(t => t.name === 'CreateReactionHiddenFromApiInput')
  ).toBeUndefined()
  expect(
    schema.types.find(t => t.name === 'UpdateReactionHiddenFromApiInput')
  ).toBeUndefined()
})

test('Generates create input types only for fields not hidden from the insert and update api', async () => {
  const schema = await getSchema()

  expect(
    schema.types
      .find(t => t.name === 'CreateCommentInput')
      .inputFields.map(f => f.name)
  ).toEqual(['title', 'body', 'titleHiddenFromUpdateAndFetchApi', 'post'])

  expect(
    schema.types
      .find(t => t.name === 'UpdateCommentInput')
      .inputFields.map(f => f.name)
  ).toEqual(['title', 'body', 'titleHiddenFromInsertAndFetchApi', 'post'])
})

test('Exposes fields in resource types only if they are not hidden', async () => {
  const schema = await getSchema()

  expect(
    schema.types.find(t => t.name === 'Comment').fields.map(f => f.name)
  ).toEqual(
    [
      'id',
      'createdAt',
      'updatedAt',
      'title',
      'body',
      'titleHiddenFromInsertAndFetchApi',
      'titleHiddenFromUpdateAndFetchApi',
      'post'
    ].filter(
      f =>
        ![
          'titleHiddenFromInsertAndFetchApi',
          'titleHiddenFromUpdateAndFetchApi'
        ].includes(f)
    )
  )
})

test('Generates CreateResource mutations only for resources exposed to insert api', async () => {
  const schema = await getSchema()

  expect(schema.types.map(t => t.name).includes('CreateTagInput')).toBe(true)
  expect(schema.types.map(t => t.name).includes('CreateCommentInput')).toBe(
    true
  )
  expect(
    schema.types.map(t => t.name).includes('InsertReactionHiddenFromApiInput')
  ).toBe(false)
  expect(
    schema.types
      .find(t => t.name === 'Mutation')
      .fields.map(f => f.name)
      .includes('insertReactionHiddenFromApi')
  ).toBe(false)
})

test('Generates fetch queries only for resources exposed to fetch api', async () => {
  const queries = (await getSchema()).types
    .find(t => t.name === 'Query')
    .fields.map(f => f.name)

  expect(queries).toEqual(
    [
      'tag',
      'tags',
      'tagsCount',
      'comment',
      'comments',
      'commentsCount',
      'user',
      'users',
      'usersCount',
      'post',
      'posts',
      'postsCount',
      'reaction',
      'reactions',
      'reactionsCount',
      'reactionHiddenFromApi',
      'reactionHiddenFromApis',
      'resourceCanUpdate',
      'resourceCanUpdates',
      'resourceCanUpdatesCount'
    ].filter(
      q => !['reactionHiddenFromApi', 'reactionHiddenFromApis'].includes(q)
    )
  )
})

test('Generates updateResource mutations only for resources exposed to update api', async () => {
  const schema = await getSchema()

  expect(schema.types.map(t => t.name).includes('UpdateTagInput')).toBe(true)
  expect(schema.types.map(t => t.name).includes('UpdateCommentInput')).toBe(
    true
  )
  expect(
    schema.types.map(t => t.name).includes('updateReactionHiddenFromApi')
  ).toBe(false)
  expect(schema.types.map(t => t.name).includes('UpdatePostInput')).toBe(false)
  expect(
    schema.types
      .find(t => t.name === 'Mutation')
      .fields.map(f => f.name)
      .includes('updatePost')
  ).toBe(false)
})

test('Generates deleteResource mutations only for resources exposed to delete api', async () => {
  const schema = await getSchema()

  expect(
    schema.types
      .find(t => t.name === 'Mutation')
      .fields.map(f => f.name)
      .includes('deletePost')
  ).toBe(false)
})

test('Generates subscriptions only for resources exposed to subscriptions', async () => {
  const schema = await getSchema()

  const subscriptions = schema.types
    .find(t => t.name === 'Subscription')
    .fields.map(f => f.name)

  expect(subscriptions.includes('postCreated')).toBe(false)
  expect(subscriptions.includes('reactionHiddenFromApiCreated')).toBe(false)
  expect(subscriptions).toEqual(['commentCreated', 'postDeleted'])
})
