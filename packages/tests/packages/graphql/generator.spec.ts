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

    expect(schema.types.find(t => t.name === 'insert_tag_input')).toBeDefined()
    expect(schema.types.find(t => t.name === 'update_tag_input')).toBeDefined()
    expect(
        schema.types.find(t => t.name === 'insert_comment_input')
    ).toBeDefined()
    expect(
        schema.types.find(t => t.name === 'update_comment_input')
    ).toBeDefined()
    expect(
        schema.types.find(
            t => t.name === 'insert_reaction_hidden_from_api_input'
        )
    ).toBeUndefined()
    expect(
        schema.types.find(
            t => t.name === 'update_reaction_hidden_from_api_input'
        )
    ).toBeUndefined()
})

test('Generates insert input types only for fields not hidden from the insert and update api', async () => {
    const schema = await getSchema()

    expect(
        schema.types
            .find(t => t.name === 'insert_comment_input')
            .inputFields.map(f => f.name)
    ).toEqual([
        'title',
        'body',
        'title_hidden_from_update_and_fetch_api',
        'post'
    ])

    expect(
        schema.types
            .find(t => t.name === 'update_comment_input')
            .inputFields.map(f => f.name)
    ).toEqual([
        'title',
        'body',
        'title_hidden_from_insert_and_fetch_api',
        'post'
    ])
})

test('Exposes fields in resource types only if they are not hidden', async () => {
    const schema = await getSchema()

    expect(
        schema.types.find(t => t.name === 'comment').fields.map(f => f.name)
    ).toEqual(
        [
            'id',
            'created_at',
            'updated_at',
            'title',
            'body',
            'title_hidden_from_insert_and_fetch_api',
            'title_hidden_from_update_and_fetch_api',
            'post'
        ].filter(
            f =>
                ![
                    'title_hidden_from_insert_and_fetch_api',
                    'title_hidden_from_update_and_fetch_api'
                ].includes(f)
        )
    )
})

test('Generates insert_resource mutations only for resources exposed to insert api', async () => {
    const schema = await getSchema()

    expect(schema.types.map(t => t.name).includes('insert_tag_input')).toBe(
        true
    )
    expect(schema.types.map(t => t.name).includes('insert_comment_input')).toBe(
        true
    )
    expect(
        schema.types
            .map(t => t.name)
            .includes('insert_reaction_hidden_from_api_input')
    ).toBe(false)
    expect(
        schema.types
            .find(t => t.name === 'Mutation')
            .fields.map(f => f.name)
            .includes('insert_reaction_hidden_from_api')
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
            'comment',
            'comments',
            'user',
            'users',
            'post',
            'posts',
            'reaction',
            'reactions',
            'reaction_hidden_from_api',
            'reaction_hidden_from_apis'
        ].filter(
            q =>
                ![
                    'reaction_hidden_from_api',
                    'reaction_hidden_from_apis'
                ].includes(q)
        )
    )
})

test('Generates update_resource mutations only for resources exposed to update api', async () => {
    const schema = await getSchema()

    expect(schema.types.map(t => t.name).includes('update_tag_input')).toBe(
        true
    )
    expect(schema.types.map(t => t.name).includes('update_comment_input')).toBe(
        true
    )
    expect(
        schema.types
            .map(t => t.name)
            .includes('update_reaction_hidden_from_api')
    ).toBe(false)
    expect(schema.types.map(t => t.name).includes('update_post_input')).toBe(
        false
    )
    expect(
        schema.types
            .find(t => t.name === 'Mutation')
            .fields.map(f => f.name)
            .includes('update_post')
    ).toBe(false)
})

test('Generates delete_resource mutations only for resources exposed to delete api', async () => {
    const schema = await getSchema()

    expect(
        schema.types
            .find(t => t.name === 'Mutation')
            .fields.map(f => f.name)
            .includes('delete_post')
    ).toBe(false)
})

test('Generates subscriptions only for resources exposed to subscriptions', async () => {
    const schema = await getSchema()

    const subscriptions = schema.types
        .find(t => t.name === 'Subscription')
        .fields.map(f => f.name)

    expect(subscriptions.includes('post_inserted')).toBe(false)
    expect(subscriptions.includes('reaction_hidden_from_api_inserted')).toBe(
        false
    )
    expect(subscriptions).toEqual(['comment_inserted', 'post_deleted'])
})
