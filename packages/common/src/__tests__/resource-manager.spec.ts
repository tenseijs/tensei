import { ResourceManager } from '../resources/ResourceManager'

import db from './helpers/db'
import { Tag, Comment, User, Post } from './helpers/resources'

const setup = (resources = []) => new ResourceManager([Tag, Comment, User, Post, ...resources], db as any)

describe('ResourceManager', () => {
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
                    await setup().create({} as any, slug, {})
                } catch (error) {
                    expect(error).toMatchSnapshot()
                }

                expect(db.create).not.toHaveBeenCalled()
            })
        })
    })
    
    describe('breakFieldsIntoRelationshipsAndNonRelationships', () => {
        test('correctly breaks payload into relationship fields and non relationships fields', () => {
            const { relationshipFieldsPayload, nonRelationshipFieldsPayload } = setup().breakFieldsIntoRelationshipsAndNonRelationships({
                tags: [1, 2],
                title: 'TEST_TITLE', 
                description: 'TEST_DESCRIPTION'
            }, Post)
    
            expect(relationshipFieldsPayload).toEqual({
                tags: [1, 2]
            })
    
            expect(nonRelationshipFieldsPayload).toEqual({
                title: 'TEST_TITLE', 
                description: 'TEST_DESCRIPTION'
            })
        })
    
        test('ignores fields not in payload', () => {
            const { relationshipFieldsPayload, nonRelationshipFieldsPayload } = setup().breakFieldsIntoRelationshipsAndNonRelationships({
                tags: [1, 2],
                title: 'TEST_TITLE', 
                description: 'TEST_DESCRIPTION'
            }, Post)
    
            expect(Object.keys({
                ...relationshipFieldsPayload,
                ...nonRelationshipFieldsPayload
            }).includes('content')).toBeFalsy()
        })
    })
    
    describe('deleteById', () => {
        test('calls deleteById method from the db', () => {
            setup().deleteById({} as any, 'posts', '1')

            expect(db.deleteById).toHaveBeenCalled()
        })
    })

    describe('createAdmin', () => {
        test('throws an error if administrator roles resource is not registered', async () => {
            expect.assertions(2)

            try {
                await setup([
                    {
                        data: {
                            name: 'Administrator',
                            slug: 'administrators'
                        }
                    }
                ] as any).createAdmin({} as any, 'administrators', {})
            } catch (error) {
                expect(error.status).toBe(422)
                expect(error.message).toBe('The role resource must be registered.')
            }
        })

        test('fetches an admin from db if role resource is registered', async () => {
            const testSuperAdminRole = 303938494893892

            db.findOneByField = jest.fn(() => Promise.resolve({
                id: testSuperAdminRole
            }))

            const roleResource = {
                data: {
                    slug: 'administrator-roles',
                    fields: []
                }
            }

            const adminResource = {
                data: {
                    name: 'Administrator',
                    slug: 'administrators',
                    fields: []
                }
            }

            const rm = setup([
                adminResource,
                roleResource
            ] as any)

            rm.create = jest.fn(() => Promise.resolve({ id: 23 }))

            await rm.createAdmin({} as any, 'administrators', {})

            expect(rm.create).toHaveBeenCalledWith({}, adminResource, {
                administrator_roles: [testSuperAdminRole]
            })
            expect(db.findOneByField).toHaveBeenCalledWith(roleResource, 'slug', 'super-admin')
        })

        test('throws an error if no super-admin role is found', async () => {
            expect.assertions(2)

            db.findOneByField = jest.fn(() => Promise.resolve(null))

            const roleResource = {
                data: {
                    slug: 'administrator-roles',
                    fields: []
                }
            }

            const adminResource = {
                data: {
                    name: 'Administrator',
                    slug: 'administrators',
                    fields: []
                }
            }

            const rm = setup([
                adminResource,
                roleResource
            ] as any)

            try {
                await rm.createAdmin({} as any, 'administrators', {})
            } catch (error) {
                expect(error.status).toBe(422)
                expect(error.message).toBe('The super-admin role must be setup before creating an administrator user.')
            } 
        })
    })
})
