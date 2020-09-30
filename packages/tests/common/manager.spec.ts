import { Manager, ResourceContract } from '@tensei/common'

import db from '../helpers/db'
import { Tag, Comment, User, Post, UserNoRel } from '../helpers/resources'

const setup = (
    resource: string | ResourceContract = 'users',
    resources = [],
    request = {
        body: {
            form: {}
        }
    } as any,
    instance = db
) =>
    {
        const manager = new Manager(
            request,
            [Tag, Comment, User, Post, ...resources],
            instance as any
        ).setResource(resource)

        manager.authorize = jest.fn(() => Promise.resolve())

        return manager
    }

describe('Manager', () => {
    describe('findResource', () => {
        test('can find a resource by string', () => {
            const resource = setup().findResource('users')

            expect(resource.data.name).toBe(User.data.name)
        })

        test('returns the resourceOrSlug if it is an instance', () => {
            const resource = setup().findResource(User)

            expect(resource.data.name).toBe(User.data.name)
        })

        test('throws an error if the resource is not found', () => {
            expect(() => setup().findResource('unknown-resource')).toThrow({
                message: 'Resource unknown-resource not found.'
            } as any)
        })

        test('throws an error if the slug is not passed in', () => {
            expect(() => setup().findResource(undefined as any)).toThrow({
                message: 'Resource undefined not found.'
            } as any)
        })
    })

    describe('create', () => {
        ;['posts', 'comments', 'users', 'tags'].forEach(slug => {
            test(`validates payload before creating any record (${slug})`, async () => {
                db.create.mockClear()
                expect.assertions(2)

                try {
                    await setup(slug).create({})
                } catch (error) {
                    expect(error).toMatchSnapshot()
                }

                expect(db.create).not.toHaveBeenCalled()
            })
        })
    })

    describe('breakFieldsIntoRelationshipsAndNonRelationships', () => {
        test('correctly breaks payload into relationship fields and non relationships fields', () => {
            const {
                relationshipFieldsPayload,
                nonRelationshipFieldsPayload
            } = setup('posts').breakFieldsIntoRelationshipsAndNonRelationships({
                tags: [1, 2],
                title: 'TEST_TITLE',
                description: 'TEST_DESCRIPTION'
            })

            expect(relationshipFieldsPayload).toEqual({
                tags: [1, 2]
            })

            expect(nonRelationshipFieldsPayload).toEqual({
                title: 'TEST_TITLE',
                description: 'TEST_DESCRIPTION'
            })
        })

        test('ignores fields not in payload', () => {
            const {
                relationshipFieldsPayload,
                nonRelationshipFieldsPayload
            } = setup(Post).breakFieldsIntoRelationshipsAndNonRelationships({
                tags: [1, 2],
                title: 'TEST_TITLE',
                description: 'TEST_DESCRIPTION'
            })

            expect(
                Object.keys({
                    ...relationshipFieldsPayload,
                    ...nonRelationshipFieldsPayload
                }).includes('content')
            ).toBeFalsy()
        })
    })

    describe('deleteById', () => {
        test('calls deleteById method from the db', async () => {
            const manager = setup(Post)

            manager.findOneById = jest.fn(() => ({} as any))

            await manager.deleteById('1')

            expect(db.deleteById).toHaveBeenCalled()
        })
    })

    describe('updateOneByField', () => {
        test('calls updateOneByField method from the db', async () => {
            expect.assertions(1)
            await setup(Post).updateOneByField('title', 'title', {
                title: 'new title',
                description: 'some description',
                content: 'some content',
                av_cpc: 2,
                category: 'food',
                user_id: 1,
                published_at: new Date(),
                scheduled_for: new Date()
            })

            expect(db.updateOneByField).toHaveBeenCalled()
        })
        test('throw error if database field is not on resource', async () => {
            const s = setup(Post).updateOneByField('version', 'title', {
                title: 'new title',
                description: 'some description',
                content: 'some content',
                av_cpc: 2,
                category: 'food',
                user_id: 1,
                published_at: new Date(),
                scheduled_for: new Date()
            })
            await expect(s).rejects.toThrow(
                'The field version does not exist on resource Post.'
            )
        })
    })

    describe('update', () => {
        test('calls update method from the db', async () => {
            const manager = setup(Post)

            db.findOneById = jest.fn(() => ({} as any))

            await manager.update(1, {
                title: 'new title',
                description: 'some description',
                content: 'some content',
                av_cpc: 2,
                category: 'food',
                user_id: 1,
                published_at: new Date(),
                scheduled_for: new Date()
            })

            expect(db.update).toHaveBeenCalled()
        })
    })

    describe('validateUniqueFields', () => {
        test('calls updateManyByIds method from the db when creating relational fields', async () => {
            db.findOneByFieldExcludingOne.mockClear()
            db.findOneByField.mockClear()
            expect.assertions(3)

            try {
                await setup(User).validateUniqueFields({
                    email: 'dodo@email.com'
                })
            } catch (error) {
                expect(error).toEqual([
                    {
                        field: 'email',
                        message:
                            'A user already exists with email dodo@email.com.'
                    }
                ] as any)
            }
            expect(db.findOneByField).toHaveBeenCalled()
            expect(db.findOneByFieldExcludingOne).not.toHaveBeenCalled()
        })
        test('does not call findOneByField and findOneByFieldExcludingOne method from the db when check fails', async () => {
            db.findOneByFieldExcludingOne.mockClear()
            db.findOneByField.mockClear()
            expect.assertions(2)

            await setup(User).validateUniqueFields({ content: 'some content' })

            expect(db.findOneByField).not.toHaveBeenCalled()
            expect(db.findOneByFieldExcludingOne).not.toHaveBeenCalled()
        })
    })

    describe('validateRelationshipFields', () => {
        test('calls findAllByIds method from the db when field Has Many fields', async () => {
            db.findAllByIds.mockClear()
            db.findOneById.mockClear()
            expect.assertions(1)

            db.findAllByIds = jest.fn(() => [{}, {}]) as any

            await setup(User, [], {}, db).validateRelationshipFields({
                posts: [1, 2]
            })
            expect(db.findAllByIds).toHaveBeenCalled()
        })
        test('throws error when invalid values are provided to validator', async () => {
            expect.assertions(1)

            try {
                await setup(User).validateRelationshipFields({
                    posts: [1, 2, 3]
                })
            } catch (error) {
                expect(error).toEqual([
                    {
                        field: 'posts',
                        message:
                            'Invalid values were provided for the related resource. Make sure all values provided exist in the database table posts'
                    }
                ] as any)
            }
        })
    })

    describe('runAction method', () => {
        test('calls findAllByIds method', async () => {
            db.findAllByIds.mockClear()

            const response1 = await setup(Post).runAction('archive')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response1).toMatchSnapshot()

            const response2 = await setup(Post).runAction('fix-seo')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response2).toMatchSnapshot()

            const response3 = await setup(Post).runAction('check-status')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response3).toMatchSnapshot()

            const response4 = await setup(Post, [], {
                body: {
                    form: {
                        published_at: new Date().toISOString(),
                        reason: 'reason',
                        content: 'content -example- content'
                    }
                }
            }).runAction('publish-on')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response4).toMatchSnapshot()
        })
        test('throws error when action is not on resource', async () => {
            db.findAllByIds.mockClear()
            expect.assertions(1)

            try {
                await setup(Post).runAction('delete')
            } catch (error) {
                expect(error).toEqual({
                    message: `Action delete is not defined on posts resource.`,
                    status: 404
                })
            }
        })
    })

    describe('findOneByField', () => {
        test('calls findOneByField method from db', async () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            await setup(User).findOneByField('email', 'dodo@email.com')
            expect(db.findOneByField).toHaveBeenCalled()
        })
        test('throws error if an invalid field is passed', async () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            await expect(() =>
                setup(User).findOneByField('content', 'dodo@email.com')
            ).rejects.toThrow('Field content could not be found on resource.')
        })
    })

    describe('validateRequestQuery', () => {
        test('correctly validates request query for a resource', async () => {
            expect(
                await setup().validateRequestQuery(
                    {
                        per_page: 5,
                        page: 1,
                        fields: 'email',
                        search: '',
                        filter: { 'email:contains': 'example@email.com' },
                        with: 'posts'
                    } as any,
                    User
                )
            ).toEqual({
                perPage: 5,
                page: 1,
                search: '',
                filters: [
                    {
                        field: 'email',
                        operator: 'contains',
                        value: 'example@email.com'
                    }
                ],
                noPagination: 'false',
                fields: ['email'],
                withRelationships: ['posts']
            })
        })
    })
    describe('findAll', () => {
        test('calls findAll method from db', async () => {
            expect.assertions(1)
            await setup(User).findAll({
                query: {
                    per_page: 5,
                    page: 1,
                    fields: 'email',
                    search: '',
                    filters: [{ 'email:contains': 'example@email.com' }],
                    noPagination: false,
                    withRelationships: ['posts']
                }
            } as any)

            expect(db.findAll).toHaveBeenCalled()
        })
    })

    describe('findOneById', () => {
        test('calls findOneById method from db', async () => {
            db.findOneById.mockClear()
            expect.assertions(1)

            db.findOneById = jest.fn(() => ({
                id: 1
            }))

            await setup(User, [], {
                query: {}
            }).findOneById(1)

            expect(db.findOneById).toHaveBeenCalled()
        })

        test('throws error when no model is found', async () => {
            db.findOneById = jest.fn(() => null)
            expect.assertions(1)

            try {
                await setup(User, [], {
                    query: {}
                }).findOneById(1)
            } catch (error) {
                expect(error).toEqual({
                    message: `Could not find a resource with id 1`,
                    status: 404
                } as any)
            }
        })
    })

    describe('findAllRelatedResource', () => {
        test('calls findAll method from db when resource is a HasMany Field', async () => {
            expect.assertions(1)
            await setup(User, [], {
                query: {
                    perPage: 10,
                    page: 1,
                    filters: [{ 'email:contains': 'example@email.com' }]
                }
            }).findAllRelatedResource(1, Post)

            expect(db.findAll).toHaveBeenCalled()
        })

        test('throw error when it manager cannot find related HasManyField in the resources', async () => {
            expect.assertions(1)
            Post.data.name = 'postas'

            try {
                await setup(User, [], {
                    query: {
                        perPage: 10,
                        page: 1,
                        filters: [{ 'email:contains': 'example@email.com' }]
                    }
                }).findAllRelatedResource(1, Post)
            } catch (error) {
                expect(error).toEqual({
                    message: 'Related field not found between User and postas.',
                    status: 404
                })
            }

            Post.data.name = 'Post'
        })

        test('calls findAllBelongingToMany method from db when resource is a BelongsToMany Field', async () => {
            expect.assertions(1)
            await setup(Post, [], {
                query: {
                    perPage: 10,
                    page: 1,
                    filters: [{ 'email:contains': 'example@email.com' }]
                }
            }).findAllRelatedResource(1, Tag)

            expect(db.findAllBelongingToMany).toHaveBeenCalled()
        })
    })

    describe('findOneByField', () => {
        test('calls findOneByField method from db', async () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            await setup(User).findOneByField('email', 'dodo@email.com')
            expect(db.findOneByField).toHaveBeenCalled()
        })

        test('throws error', async () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            await expect(() =>
                setup(User).findOneByField('content', 'dodo@email.com')
            ).rejects.toThrow('Field content could not be found on resource.')
        })
    })

    describe('validateRequestQuery', () => {
        test('validates and parses query information', async () => {
            expect(
                await setup(User).validateRequestQuery({
                    per_page: 5,
                    page: 1,
                    fields: 'email',
                    search: '',
                    filter: { 'email:contains': 'example@email.com' },
                    with: 'posts'
                } as any)
            ).toEqual({
                perPage: 5,
                page: 1,
                search: '',
                filters: [
                    {
                        field: 'email',
                        operator: 'contains',
                        value: 'example@email.com'
                    }
                ],
                noPagination: 'false',
                fields: ['email'],
                withRelationships: ['posts']
            })
        })
    })

    describe('findAll', () => {
        test('calls findAll method from db', async () => {
            expect.assertions(1)
            await setup(User).findAll({
                query: {
                    per_page: 5,
                    page: 1,
                    fields: 'name,email',
                    search: '',
                    filters: [{ 'email:contains': 'example@email.com' }],
                    noPagination: false,
                    withRelationships: ['posts']
                }
            } as any)

            expect(db.findAll).toHaveBeenCalled()
        })
    })

    describe('findOneById', () => {
        test('calls findOneById method from db', async () => {
            db.findOneById.mockClear()
            db.findOneById = jest.fn(() => ({
                id: 1
            }))
            expect.assertions(1)

            await setup(User, [], {
                query: {}
            }).findOneById(1)

            expect(db.findOneById).toHaveBeenCalled()
        })
    })

    describe('findAllRelatedResource', () => {
        test('calls findAll method from db when resource is a HasMany Field', async () => {
            expect.assertions(1)
            await setup(User, [], {
                query: {
                    perPage: 10,
                    page: 1,
                    filters: [{ 'email:contains': 'example@email.com' }]
                }
            }).findAllRelatedResource(1, Post)

            expect(db.findAll).toHaveBeenCalled()
        })

        test('throw error when it manager cannot find related HasManyField in the resources', async () => {
            expect.assertions(1)

            Post.data.name = 'postas'
            try {
                await setup(User, [], {
                    query: {
                        perPage: 10,
                        page: 1,
                        filters: [{ 'email:contains': 'example@email.com' }]
                    }
                }).findAllRelatedResource(1, Post)
            } catch (error) {
                expect(error).toEqual({
                    message: 'Related field not found between User and postas.',
                    status: 404
                })
            }
            Post.data.name = 'Post'
        })

        test('calls findAllBelongingToMany method from db when resource is a BelongsToMany Field', async () => {
            expect.assertions(1)
            await setup(Post, [], {
                query: {
                    perPage: 10,
                    page: 1,
                    filters: [{ 'email:contains': 'example@email.com' }]
                }
            }).findAllRelatedResource(1, Tag)

            expect(db.findAllBelongingToMany).toHaveBeenCalled()
        })
    })
})
