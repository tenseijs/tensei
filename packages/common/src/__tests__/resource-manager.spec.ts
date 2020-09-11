import { Manager } from '../resources/Manager'

import db from './helpers/db'
import { Tag, Comment, User, Post } from './helpers/resources'

const setup = (resources = []) =>
    new Manager({} as any, [Tag, Comment, User, Post, ...resources], db as any)

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
        ;['posts', 'comments', 'users', 'tags'].forEach((slug) => {
            test(`validates payload before creating any record (${slug})`, async () => {
                db.create.mockClear()
                expect.assertions(2)

                try {
                    await setup().create({} as any)
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
            setup().deleteById('1')

            expect(db.deleteById).toHaveBeenCalled()
        })
    })
})
