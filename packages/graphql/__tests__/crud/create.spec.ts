import Supertest from 'supertest'
import {
    setup,
    postBuilder,
    userBuilder,
    tagsBuilder,
    commentBuilder
} from '../helpers'

import { TenseiContract } from '@tensei/core'
;['mysql', 'pg', 'sqlite', 'mongodb'].forEach((databaseClient: any) => {
    test(`${databaseClient} - can creates a record in the database`, async () => {
        const { app } = await setup({
            databaseClient
        })

        const client = Supertest(app)

        const response = await client.post('/graphql').send({
            query: `
            mutation {
                createTag(input: {
                    name: "Lorem"
                    description: "Ipsum"
                }) {
                    id,
                    name,
                    description
                }
            }
            `
        })

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            data: {
                createTag: {
                    id: expect.any(String),
                    name: 'Lorem',
                    description: 'Ipsum'
                }
            }
        })
    })

    test(`${databaseClient} - can creates a record in the database with has many relationship`, async () => {
        const { app, manager } = (await setup({
            databaseClient
        })) as TenseiContract

        const client = Supertest(app)

        const userSkeleton = userBuilder()
        const firstPostSkeleton = postBuilder()
        const secondPostSkeleton = postBuilder()

        const Post = manager({} as any)('Post')

        const [post1, post2] = await Promise.all([
            Post.database().create(firstPostSkeleton),
            Post.database().create(secondPostSkeleton)
        ])

        const response = await client.post('/graphql').send({
            query: `
            mutation {
                createUser(input: {
                    password: "password"
                    email: "${userSkeleton.email}"
                    full_name: "${userSkeleton.full_name}"
                    posts: ["${post1.id}", "${post2.id}"]
                }) {
                    id
                    email
                    full_name
                    posts {
                        id
                        title
                        description
                    }
                }
            }
            `
        })

        expect(response.status).toBe(200)
        expect({
            data: {
                createUser: {
                    ...response.body.data.createUser,
                    posts: response.body.data.createUser.posts.sort(
                        (p1, p2) => p1.id - p2.id
                    )
                }
            }
        }).toEqual({
            data: {
                createUser: {
                    id: expect.any(String),
                    email: userSkeleton.email,
                    full_name: userSkeleton.full_name,
                    posts: [
                        {
                            id: post1.id.toString(),
                            title: post1.title,
                            description: post1.description
                        },
                        {
                            id: post2.id.toString(),
                            title: post2.title,
                            description: post2.description
                        }
                    ].sort((p1, p2) => p1.id - p2.id)
                }
            }
        })
    })

    test(`${databaseClient} - can creates a record in the database with belongs to relationship`, async () => {
        const { app, manager } = (await setup(
            {
                databaseClient
            },
        )) as TenseiContract

        const client = Supertest(app)

        const commentSkeleton = commentBuilder()
        const postSkeleton = postBuilder()

        const Post = manager({} as any)('Post')

        const post = await Post.database().create(postSkeleton)

        const response = await client.post('/graphql').send({
            query: `
            mutation {
                createComment(input: {
                    title: "${commentSkeleton.title}"
                    body: "${commentSkeleton.body}"
                    ${databaseClient === 'mongodb' ? 'post' : 'post_id'}: "${
                post.id
            }"
                }) {
                    id
                    title
                    body
                    post {
                        id
                        title
                        description
                    }
                }
            }
            `
        })

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            data: {
                createComment: {
                    id: expect.any(String),
                    title: commentSkeleton.title,
                    body: commentSkeleton.body,
                    post: {
                        id: expect.any(String),
                        title: post.title,
                        description: post.description
                    }
                }
            }
        })
    })

    test(`${databaseClient} - can creates a record in the database with belongs to many relationship`, async () => {
        const { app, manager } = (await setup({
            databaseClient
        })) as TenseiContract

        const client = Supertest(app)

        const firstPostSkeleton = postBuilder()
        const secondPostSkeleton = postBuilder()

        const tagSkeleton = tagsBuilder()

        const Post = manager({} as any)('Post')
        const T = manager({} as any)('Tag')

        const [post1, post2] = await Promise.all([
            Post.database().create(firstPostSkeleton),
            Post.database().create(secondPostSkeleton)
        ])

        const response = await client.post('/graphql').send({
            query: `
            mutation {
                createTag(input: {
                    name: "${tagSkeleton.name}"
                    description: "${tagSkeleton.description}"
                    posts: ["${post1.id}", "${post2.id}"]
                }) {
                    id
                    name
                    description
                    posts {
                        id
                        title
                        description
                        tags (per_page: 10) {
                            id
                            name
                            description
                        }
                    }
                }
            }
            `
        })

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            data: {
                createTag: {
                    id: expect.any(String),
                    name: tagSkeleton.name,
                    description: tagSkeleton.description
                }
            }
        })

        expect(response.body.data.createTag.posts).toContainObject({
            id: expect.any(String),
            title: post1.title,
            description: post1.description,
            tags: [
                {
                    id: expect.any(String),
                    name: tagSkeleton.name,
                    description: tagSkeleton.description
                }
            ]
        })
        expect(response.body.data.createTag.posts).toContainObject({
            id: expect.any(String),
            title: post2.title,
            description: post2.description,
            tags: [
                {
                    id: expect.any(String),
                    name: tagSkeleton.name,
                    description: tagSkeleton.description
                }
            ]
        })
    })
})
