import Faker from 'faker'
import { Tag, Comment, User, Post, Reaction } from './resources'

export const resources = [Tag, Comment, User, Post, Reaction]

export const fakeTag = () =>
    ({
        name: Faker.lorem.word(),
        description: Faker.lorem.sentence()
    } as {
        id?: string | number
        name: string
        description: string
    })

export const fakeUser = () => ({
    id: undefined,
    full_name: Faker.name.findName(),
    email: Faker.internet.exampleEmail(),
    password: Faker.internet.password()
})

export const fakePost = () => ({
    id: undefined,
    title: Faker.lorem.sentence(),
    description: Faker.lorem.sentence(),
    content: Faker.lorem.sentence(),
    av_cpc: Faker.random.number(),
    category: Faker.random.arrayElement([
        'javascript',
        'angular',
        'pg',
        'mysql'
    ]),
    approved: Faker.random.boolean(),
    scheduled_for: Faker.date.future(),
    published_at: Faker.date.past()
})
