import Knex from 'knex'
import Faker from 'faker'
import Bcrypt from 'bcryptjs'
import { tensei, TenseiContract } from '@tensei/core'
import { plugin, Plugin, User as IUser } from '@tensei/common'

import { Tag, Comment, User, Post, Reaction } from './resources'

interface ConfigureSetup {
    plugins?: Plugin[]
    admin?: IUser
    apiPath?: string
    databaseClient?: 'mysql' | 'sqlite3' | 'pg'
    dashboardPath?: string
    createAndLoginAdmin?: boolean
}

let cachedInstance: TenseiContract | null = null

export const fakePostData = () => ({
    title: Faker.lorem.word(),
    description: Faker.lorem.word(),
    content: Faker.lorem.sentence(20),
    av_cpc: Faker.random.number(),
    published_at: Faker.date.future(),
    scheduled_for: Faker.date.future(),
    category: Faker.random.arrayElement(['javascript', 'angular'])
})

export const fakeTagData = () => ({
    name: Faker.lorem.word(),
    description: Faker.lorem.word()
})

export const setup = async (
    {
        plugins,
        admin,
        apiPath,
        databaseClient,
        dashboardPath,
        createAndLoginAdmin
    }: ConfigureSetup = {},
    forceNewInstance = false
) => {
    let dbConfig: Knex.Config = {
        client: 'mysql',
        connection: {
            host: process.env.DATABASE_HOST || '127.0.0.1',
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSSWORD || '',
            database: process.env.DATABASE_DB || 'testdb'
        }
    }

    if (databaseClient === 'sqlite3') {
        dbConfig = {
            client: 'sqlite3',
            connection: './tensei.sqlite',
            useNullAsDefault: true
        }
    }

    if (databaseClient === 'pg') {
        dbConfig = {
            client: 'pg',
            connection: {
                host: process.env.DATABASE_HOST || '127.0.0.1',
                user: process.env.DATABASE_USER || 'root',
                password: process.env.DATABASE_PASSWORD || '',
                database: process.env.DATABASE_DB || 'tensei'
            }
        }
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
                  })
              ]
            : [])
    ])

    if (apiPath) {
        instance.apiPath(apiPath)
    }

    if (dashboardPath) {
        instance.dashboardPath(dashboardPath)
    }

    instance = await instance
        .resources([Post, Tag, User, Comment, Reaction])
        .register()

    const knex: Knex = instance.databaseClient
    ;(await knex.schema.hasTable('sessions'))
        ? await knex('sessions').truncate()
        : null

    await Promise.all([
        knex('users').truncate(),
        knex('posts').truncate(),
        knex('administrators').truncate()
    ])

    return instance
}

export const cleanup = async (databaseClient: Knex) => {
    await databaseClient.destroy()
}

export const createAdminUser = async (knex: Knex) => {
    const user = {
        name: Faker.name.findName(),
        email: Faker.internet.email(),
        password: 'password'
    }

    const id = await knex('administrators').insert({
        name: user.name,
        email: user.email,
        password: Bcrypt.hashSync(user.password)
    })

    return {
        id: id[0],
        ...user
    }
}
