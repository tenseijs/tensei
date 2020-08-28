import { ResourceManager } from '../resources/ResourceManager'

import { Tag, Comment, User, Post } from './helpers/resources'

const setup = () => new ResourceManager([
    Tag, Comment, User, Post
], {} as any)

test('<findResource> can find a resource by string', () => {
    const resource = setup().findResource('users')

    expect(resource.data.name).toBe(User.data.name)
})

test('<findResource> returns the resourceOrSlug if it is an instance', () => {
    const resource = setup().findResource(User)

    expect(resource.data.name).toBe(User.data.name)
})

test('<findResource> throws an error if the resource is not found', () => {
    expect(() => setup().findResource('unknown-resource')).toThrow({
        message: 'Resource unknown-resource not found.'
    } as any)
})

test('<findResource> throws an error if the slug is not passed in', () => {
    expect(() => setup().findResource(undefined as any)).toThrow({
        message: 'Resource undefined not found.'
    } as any)
})
