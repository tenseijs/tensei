import { Manager } from '../resources/Manager'

import db from './helpers/db'
import { Tag, Comment, User, Post, UserNoRel } from './helpers/resources'

const setup = (resources = []) =>
    new Manager([Tag, Comment, User, Post, ...resources], db as any)

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
                message: 'Resource unknown-resource not found.',
            } as any)
        })

        test('throws an error if the slug is not passed in', () => {
            expect(() => setup().findResource(undefined as any)).toThrow({
                message: 'Resource undefined not found.',
            } as any)
        })
    })

    describe('create', () => {
        ['posts', 'comments', 'users', 'tags'].forEach((slug) => {
            test(`validates payload before creating any record (${slug})`, async () => {
                db.create.mockClear()
                expect.assertions(2)

                try {
                    await setup().create({} as any, slug, {})
                } catch (error) {
                    expect(error).toMatchSnapshot()
                }

                expect(db.create).not.toHaveBeenCalled()
            })
        })
        test('can create resource', async () => {
            await setup().create({} as any, 'users', {
                email: 'man@email.com',
                full_name: 'woman',
                password: 'password',
            })
            expect(db.create).toHaveBeenCalled()
        })
    })

    describe('breakFieldsIntoRelationshipsAndNonRelationships', () => {
        test('correctly breaks payload into relationship fields and non relationships fields', () => {
            const {
                relationshipFieldsPayload,
                nonRelationshipFieldsPayload,
            } = setup().breakFieldsIntoRelationshipsAndNonRelationships(
                {
                    tags: [1, 2],
                    title: 'TEST_TITLE',
                    description: 'TEST_DESCRIPTION',
                },
                Post
            )

            expect(relationshipFieldsPayload).toEqual({
                tags: [1, 2],
            })

            expect(nonRelationshipFieldsPayload).toEqual({
                title: 'TEST_TITLE',
                description: 'TEST_DESCRIPTION',
            })
        })

        test('ignores fields not in payload', () => {
            const {
                relationshipFieldsPayload,
                nonRelationshipFieldsPayload,
            } = setup().breakFieldsIntoRelationshipsAndNonRelationships(
                {
                    tags: [1, 2],
                    title: 'TEST_TITLE',
                    description: 'TEST_DESCRIPTION',
                },
                Post
            )

            expect(
                Object.keys({
                    ...relationshipFieldsPayload,
                    ...nonRelationshipFieldsPayload,
                }).includes('content')
            ).toBeFalsy()
        })
    })

    describe('deleteById', () => {
        test('calls deleteById method from the db', () => {
            setup().deleteById({} as any, 'posts', '1')

            expect(db.deleteById).toHaveBeenCalled()
        })
    })

    describe('updateOneByField', () => {
        test('calls updateOneByField method from the db', async () => {
            expect.assertions(1)
            await setup().updateOneByField({} as any, 'posts', 'title', 'title', {
                title: 'new title',
                description: 'some description',
                content: 'some content',
                av_cpc: 2,
                category: 'food',
                user_id: 1,
                published_at: new Date(),
                scheduled_for: new Date(),
            })

            expect(db.updateOneByField).toHaveBeenCalled()
        })
        test('throw error if database field is not on resource', async () => {
            const s = setup().updateOneByField({} as any, 'posts', 'version', 'title', {
                title: 'new title',
                description: 'some description',
                content: 'some content',
                av_cpc: 2,
                category: 'food',
                user_id: 1,
                published_at: new Date(),
                scheduled_for: new Date(),
            })
            await expect(s).rejects.toThrow('The field version does not exist on resource Post.')
        })
    })

    describe('update', () => {
        test('calls update method from the db', async () => {
            await setup().update({} as any, 'posts', 1, {
                title: 'new title',
                description: 'some description',
                content: 'some content',
                av_cpc: 2,
                category: 'food',
                user_id: 1,
                published_at: new Date(),
                scheduled_for: new Date(),
            })

            expect(db.update).toHaveBeenCalled()
        })
    })

    describe('updateRelationshipFields', () => {
        test('calls updateManyByIds and updateManyWhere method from the db', async () => {
            expect.assertions(2)

            await setup().updateRelationshipFields(User, {
                full_name: 'philly',
            }, 1)

            expect(db.updateManyByIds).toHaveBeenCalled()
            expect(db.updateManyWhere).toHaveBeenCalled()
        })
        test('throw error when there is no related resource found', async () => {
            expect.assertions(1)
            try {
                await setup().updateRelationshipFields(Comment, {
                    title: 'new comment',
                }, 1)
            } catch (error) {
                expect(error).toEqual([
                    {
                        message: 'The related resource Rating was not found.',
                    },
                ] as any)
            }
        })
        test('throw error', async () => {
            expect.assertions(1)

            const UserNew = User

            UserNew.data.name = 'man'

            try {
                await setup().updateRelationshipFields(UserNew, {
                    full_name: 'philly',
                }, 1)
            } catch (error) {
                expect(error).toEqual([
                    {
                        "message": "A related BelongsTo relationship must be registered on the Post resource. This will link the man to the Post resource.",
                    },
                ] as any)
            }
            UserNew.data.name = 'User'
        })
    })
    describe('createRelationalFields', () => {
        test('calls updateManyByIds method from the db when creating relational fields', async () => {
            expect.assertions(1)

            await setup().createRelationalFields(User, {
                full_name: 'philly',
            }, 'user')

            expect(db.updateManyByIds).toHaveBeenCalled()
        })
        test('throw error', async () => {
            expect.assertions(1)
            try {
                await setup().createRelationalFields(UserNoRel, {
                    full_name: 'philly',
                }, 'user')
            } catch (error) {
                expect(error).toEqual([
                    {
                        "message": "The related resource Pizza was not found.",
                    },
                ] as any)
            }
        })
        test('throw error when cannot find resource name', async () => {
            expect.assertions(1)

            const UserNew = User
            UserNew.data.name = 'man'

            try {
                await setup().createRelationalFields(UserNew, {
                    full_name: 'philly',
                }, 1)
            } catch (error) {
                expect(error).toEqual([
                    {
                        "message": "A related BelongsTo relationship must be registered on the Post resource. This will link the man to the Post resource.",
                    },
                ] as any)
            }
            UserNew.data.name = 'User'
        })
    })
    describe('validateUniqueFields', () => {
        test('calls updateManyByIds method from the db when creating relational fields', async () => {
            db.findOneByFieldExcludingOne.mockClear()
            db.findOneByField.mockClear()
            expect.assertions(3)

            const dbNew = { ...db, findOneByField: jest.fn(() => true) }
            const setup = (resources = []) =>
                new Manager([Tag, Comment, User, Post, ...resources], dbNew as any)

            try {
                await setup().validateUniqueFields({ email: 'dodo@email.com' }, User)
            } catch (error) {
                expect(error).toEqual([{
                    field: "email",
                    message: "A user already exists with email dodo@email.com.",
                }] as any)
            }
            expect(dbNew.findOneByField).toHaveBeenCalled()
            expect(dbNew.findOneByFieldExcludingOne).not.toHaveBeenCalled()
        })
        test('does not call findOneByField and findOneByFieldExcludingOne method from the db when check fails', async () => {
            db.findOneByFieldExcludingOne.mockClear()
            db.findOneByField.mockClear()
            expect.assertions(2)

            await setup().validateUniqueFields({ content: 'some content' }, User)

            expect(db.findOneByField).not.toHaveBeenCalled()
            expect(db.findOneByFieldExcludingOne).not.toHaveBeenCalled()
        })
    })

    describe('validateRelationshipFields', () => {
        test('calls findAllByIds method from the db when field Has Many fields', async () => {
            db.findAllByIds.mockClear()
            db.findOneById.mockClear()
            expect.assertions(1)

            const dbNew = { ...db, findAllByIds: jest.fn(() => []) }
            const setup = (resources = []) =>
                new Manager([Tag, Comment, User, Post, ...resources], dbNew as any)

            setup().validateRelationshipFields({ posts: 'dodo@email.com' }, User)
            expect(dbNew.findAllByIds).toHaveBeenCalled()
        })
        test('throws error when no related resource is found', async () => {
            expect.assertions(1)

            try {
                await setup().validateRelationshipFields({ title: 'new comment' }, Comment)
            } catch (error) {
                expect(error).toEqual([
                    {
                        "field": "rating",
                        "message": "The related resource Rating could not be found.",
                    },
                ] as any)
            }
        })
    })

    describe('runAction method', () => {
        test('calls findAllByIds method', async () => {
            db.findAllByIds.mockClear()
            expect.assertions(8)

            const response1 = setup().runAction({ body: { models: [] } } as any, 'posts', 'archive')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response1).toMatchSnapshot()

            const response2 = setup().runAction({ body: { models: [] } } as any, 'posts', 'fix-seo')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response2).toMatchSnapshot()

            const response3 = setup().runAction({ body: { models: [] } } as any, 'posts', 'check-status')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response3).toMatchSnapshot()

            const response4 = await setup().runAction({ body: { models: [], form: { published_at: new Date(), reason: 'some reason', content: 'some content' } } } as any, 'posts', 'publish-on')
            expect(db.findAllByIds).toHaveBeenCalled()
            expect(response4).toMatchSnapshot()
        })
        test('throws error when action is not on resource', async () => {
            db.findAllByIds.mockClear()
            expect.assertions(1)

            try {
                await setup().runAction({ body: { models: [] } } as any, 'posts', 'delete')
            } catch (error) {
                expect(error).toEqual(
                    {
                        message: `Action delete is not defined on posts resource.`,
                        status: 404,
                    })
            }
        })
    })

    describe('findOneByField', () => {
        test('calls findOneByField method from db', () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            setup().findOneByField(User, 'email', 'dodo@email.com')
            expect(db.findOneByField).toHaveBeenCalled()
        })
        test('throws error', async () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            await expect(() => setup().findOneByField(User, 'content', 'dodo@email.com')).rejects.toThrow('Field content could not be found on resource.')
        })
    })

    describe('validateRequestQuery', () => {
        test('calls findOneByField method from db', async () => {
            const s = await setup().validateRequestQuery({
                per_page: 5,
                page: 1,
                fields: 'email',
                search: '',
                filter: { 'email:contains': 'example@email.com' },
                with: 'posts',
            } as any, User)

            expect(s).toEqual({
                perPage: 5,
                page: 1,
                search: '',
                filters: [{
                    "field": "email",
                    "operator": "contains",
                    "value": "example@email.com",
                }],
                noPagination: 'false',
                fields: ['email'],
                withRelationships: ['posts']
            })
        })
    })
    describe('findAll', () => {
        test('calls findAll method from db', async () => {
            expect.assertions(1)
            await setup().findAll({
                query: {
                    per_page: 5,
                    page: 1,
                    fields: 'email',
                    search: '',
                    filters: [{ 'email:contains': 'example@email.com' }],
                    noPagination: false,
                    withRelationships: ['posts'],
                }
            } as any, User)

            expect(db.findAll).toHaveBeenCalled()
        })
    })
    describe('findOneById', () => {
        test('calls findOneById method from db', async () => {
            expect.assertions(1)

            const dbNew = { ...db, findOneById: jest.fn(() => true) }
            const setup = (resources = []) =>
                new Manager([Tag, Comment, User, Post, ...resources], dbNew as any)

            await setup().findOneById({ query: {} } as any, User, 1)

            expect(dbNew.findOneById).toHaveBeenCalled()
        })
        test('throws error when no model was found', async () => {
            expect.assertions(1)

            try {
                await setup().findOneById({ query: {} } as any, User, 1)
            } catch (error) {
                expect(error).toEqual({
                    message: `Could not find a resource with id 1`,
                    status: 404,
                } as any)
            }
        })
    })
    describe('findAllRelatedResource', () => {
        test('calls findAll method from db when resource is a HasMany Field', async () => {
            expect.assertions(1)
            await setup().findAllRelatedResource({
                query: {
                    perPage: 10,
                    page: 1,
                    filters: [{ 'email:contains': 'example@email.com' }],
                }
            } as any, 1, User, Post)

            expect(db.findAll).toHaveBeenCalled()
        })
        test('throw error when it manager cannot find related HasManyField in the resources', async () => {
            expect.assertions(1)
            const PostNew = Post

            PostNew.data.name = 'postas'
            try {
                await setup().findAllRelatedResource({
                    query: {
                        perPage: 10,
                        page: 1,
                        filters: [{ 'email:contains': 'example@email.com' }],
                    }
                } as any, 1, User, Post)
            } catch (error) {
                expect(error).toEqual(
                    {
                        message: "Related field not found between User and postas.",
                        status: 404
                    }
                )
            }
            PostNew.data.name = 'Post'

        })
        test('calls findAllBelongingToMany method from db when resource is a BelongsToMany Field', async () => {
            expect.assertions(1)
            await setup().findAllRelatedResource({
                query: {
                    perPage: 10,
                    page: 1,
                    filters: [{ 'email:contains': 'example@email.com' }],
                }
            } as any, 1, Post, Tag)

            expect(db.findAllBelongingToMany).toHaveBeenCalled()
        })
    })

    describe('findUserByEmail', () => {
        test('calls findUserByEmail method from db', () => {
            db.findUserByEmail.mockClear()
            expect.assertions(1)

            setup().findUserByEmail('dodo@email.com')
            expect(db.findUserByEmail).toHaveBeenCalled()
        })
    })

    describe('findOneByField', () => {
        test('calls findOneByField method from db', () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            setup().findOneByField(User, 'email', 'dodo@email.com')
            expect(db.findOneByField).toHaveBeenCalled()
        })
        test('throws error', async () => {
            db.findOneByField.mockClear()
            expect.assertions(1)

            await expect(() => setup().findOneByField(User, 'content', 'dodo@email.com')).rejects.toThrow('Field content could not be found on resource.')
        })
    })

    describe('validateRequestQuery', () => {
        test('calls findOneByField method from db', async () => {
            const s = await setup().validateRequestQuery({
                per_page: 5,
                page: 1,
                fields: 'email',
                search: '',
                filter: { 'email:contains': 'example@email.com' },
                with: 'posts',
            } as any, User)

            expect(s).toEqual({
                perPage: 5,
                page: 1,
                search: '',
                filters: [{
                    "field": "email",
                    "operator": "contains",
                    "value": "example@email.com",
                }],
                noPagination: 'false',
                fields: ['email'],
                withRelationships: ['posts']
            })
        })
    })

})
