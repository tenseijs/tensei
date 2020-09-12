import Knex from 'knex'
import Faker from 'faker'
import Bcrypt from 'bcryptjs'
import { Tensei, tensei, TenseiContract } from '@tensei/core'
import { plugin, Plugin, User as IUser } from '@tensei/common'

import { Tag, Comment, User, Post } from './resources'

interface ConfigureSetup {
    plugins?: Plugin[]
    admin?: IUser
    apiPath?: string
    dashboardPath?: string
    createAndLoginAdmin?: boolean
}

let cachedInstance: TenseiContract | null = null

export const fakePostData = () => ({
    title: Faker.lorem.word(),
    description: Faker.lorem.word(),
    content: Faker.lorem.sentence(),
    av_cpc: Faker.random.number(),
    published_at: Faker.date.future(),
    scheduled_for: Faker.date.future(),
    category: Faker.random.arrayElement(['javascript', 'angular']),
})

export const setup = async (
    {
        plugins,
        admin,
        apiPath,
        dashboardPath,
        createAndLoginAdmin,
    }: ConfigureSetup = {},
    forceNewInstance = false
) => {
    const dbConfig = {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'testdb',
        },
    }

    let instance = forceNewInstance
        ? tensei().databaseConfig(dbConfig)
        : cachedInstance
        ? cachedInstance
        : tensei().databaseConfig(dbConfig)

    cachedInstance = instance

    instance.plugins([
        ...(plugins || []),
        ...(admin
            ? [
                  plugin('Force auth').beforeDatabaseSetup(async ({ app }) => {
                      app.use(async (request, response, next) => {
                          // @ts-ignore
                          request.admin = admin

                          next()
                      })
                  }),
              ]
            : []),
    ])

    if (apiPath) {
        instance.apiPath(apiPath)
    }

    if (dashboardPath) {
        instance.dashboardPath(dashboardPath)
    }

    instance = await instance.resources([Post, Tag, User, Comment]).register()

    const knex: Knex = instance.databaseClient

    await knex('users').truncate()
    await knex('posts').truncate()
    await knex('sessions').truncate()
    await knex('administrators').truncate()

    return instance
}

export const cleanup = async (databaseClient: Knex) => {
    await databaseClient.destroy()
}

export const createAdminUser = async (knex: Knex) => {
    const user = {
        name: Faker.name.findName(),
        email: Faker.internet.email(),
        password: 'password',
    }

    const id = await knex('administrators').insert({
        name: user.name,
        email: user.email,
        password: Bcrypt.hashSync(user.password),
    })

    return {
        id: id[0],
        ...user,
    }
}
