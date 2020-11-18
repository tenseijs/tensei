import Faker from 'faker'
import { EntityManager } from '@mikro-orm/core'
import { MongoDriver } from '@mikro-orm/mongodb'
import { TenseiContract, plugin } from '@tensei/core'
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
    password: 'password'
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

export const cleanupDatabase = async (instance: TenseiContract) => {
    const type = instance.ctx.orm.config.get('type')

    if (type === 'mongo') {
        return cleanupMongodbDatabase(instance)
    }

    const schemaGenerator = instance.ctx.orm.getSchemaGenerator()

    await schemaGenerator.dropSchema()

    await schemaGenerator.createSchema()
}

export const cleanupMongodbDatabase = async (instance: TenseiContract) => {
    await ((instance.ctx.orm.em.getDriver() as unknown) as EntityManager<
        MongoDriver
    >)
        .getConnection()
        .getDb()
        .dropDatabase()
}

export const sortArrayById = (items: any[]) =>
    items.sort((i1: any, i2: any) => (i1.id > i2.id ? 1 : -1))

export let gql = (t: any) => t.toString()

export const setupFakeMailer = ({ sendRaw, send }) =>
    plugin('Mock mailer').setup(async ({ mailer }) => {
        mailer.send = send
        mailer.sendRaw = sendRaw
    })
