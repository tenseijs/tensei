import Knex from 'knex'
import Faker from 'faker'
import Bcrypt from 'bcryptjs'
import Mongoose from 'mongoose'
import { auth } from '@tensei/auth'
import { graphql } from '@tensei/graphql'
import { tensei, TenseiContract } from '@tensei/core'
import { build, fake, sequence } from '@jackfranklin/test-data-bot'
import {
    plugin,
    Plugin,
    User as IUser,
    SupportedDatabases
} from '@tensei/common'

import { Tag, Comment, User, Post, Reaction } from './resources'

interface ConfigureSetup {
    plugins?: Plugin[]
    admin?: IUser
    apiPath?: string
    authApiPath?: string
    databaseClient?: 'mysql' | 'sqlite3' | 'pg' | 'mongodb' | 'sqlite'
    dashboardPath?: string
    createAndLoginAdmin?: boolean
}

// export let cachedInstance: TenseiContract | null = null

export let cachedInstances: {
    [key: string]: TenseiContract | null
} = {}

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
        authApiPath
    }: ConfigureSetup = {},
    forceNewInstance = false
) => {
    let dbConfig: any = [
        {
            client: 'mysql',
            connection: {
                host: process.env.DATABASE_HOST || '127.0.0.1',
                user: process.env.DATABASE_USER || 'root',
                password: process.env.DATABASE_PASSSWORD || '',
                database: process.env.DATABASE_DB || 'testdb'
            },
            useNullAsDefault: true
        }
    ]

    if (databaseClient === 'sqlite3' || databaseClient === 'sqlite') {
        dbConfig = [
            {
                client: 'sqlite3',
                connection: {
                    filename: './tensei.sqlite'
                },
                useNullAsDefault: true
            }
        ]
    }

    if (databaseClient === 'pg') {
        dbConfig = [
            {
                client: 'pg',
                connection: {
                    host: process.env.DATABASE_HOST || '127.0.0.1',
                    user: process.env.DATABASE_USER || 'root',
                    password: process.env.DATABASE_PASSWORD || '',
                    database: process.env.DATABASE_DB || 'tenseitestdb'
                },
                useNullAsDefault: true
            }
        ]
    }

    if (databaseClient === 'mongodb') {
        dbConfig = [
            'mongodb://localhost/tensei-tests',
            {
                useUnifiedTopology: true,
                useNewUrlParser: true
            }
        ]
    }

    const derivedDatabaseFromClient =
        {
            pg: 'pg',
            mysql: 'mysql',
            sqlite3: 'sqlite',
            mongodb: 'mongodb',
            sqlite: 'sqlite'
        }[databaseClient!] || 'mysql'

    let instance = (forceNewInstance
        ? tensei()
              .database(derivedDatabaseFromClient as SupportedDatabases)
              // @ts-ignore
              .databaseConfig(...dbConfig)
        : cachedInstances[databaseClient!]
        ? cachedInstances[databaseClient!]
        : tensei()
              .database(derivedDatabaseFromClient as SupportedDatabases)
              // @ts-ignore
              .databaseConfig(...dbConfig))!

    cachedInstances[databaseClient!] = instance

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
            : []),
        auth()
            .name('Customer')
            .twoFactorAuth()
            .verifyEmails()
            .apiPath(authApiPath || 'auth')
            .twoFactorAuth()
            .plugin(),
        graphql().plugin()
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

    if ((['mysql', 'sqlite3', 'pg', 'sqlite'] as any).includes(databaseClient)) {
        const knex: Knex = instance.getDatabaseClient()
        ;(await knex.schema.hasTable('sessions'))
            ? await knex('sessions').truncate()
            : null

        await Promise.all([
            knex('users').truncate(),
            knex('tags').truncate(),
            knex('posts').truncate(),
            knex('comments').truncate(),
            knex('customers').truncate(),
            knex('posts_tags').truncate(),
            knex('administrators').truncate(),
            knex('password_resets').truncate(),
            knex('administrator_roles').truncate(),
            knex('administrator_permissions').truncate(),
            knex('administrator_password_resets').truncate(),
        ])
    }

    if (databaseClient === 'mongodb') {
        const connection: Mongoose.Connection = instance.getDatabaseClient()

        await connection.dropDatabase()
    }

    return instance
}

export const cleanup = async () => {
    await Promise.all(
        Object.keys(cachedInstances).map(dbType => {
            const databaseClient = cachedInstances[dbType]?.getDatabaseClient()

            return databaseClient.destroy
                ? databaseClient.destroy()
                : databaseClient.close()
        })
    )
}

export const createAuthUser = async (knex: Knex, extraArguments = {}) => {
    return createAdminUser(knex, 'customers', extraArguments)
}

export const createAdminUser = async (
    knex: Knex,
    table = 'administrators',
    extraArguments = {}
) => {
    const user = {
        name: Faker.name.findName(),
        email: Faker.internet.email(),
        password: 'password',
        ...extraArguments
    }

    const id = await knex(table).insert({
        name: user.name,
        email: user.email,
        password: Bcrypt.hashSync(user.password),
        ...extraArguments
    })

    return {
        id: id[0],
        ...user
    }
}

export const userBuilder = (args?: any) =>
    build('User', {
        fields: {
            full_name: fake(f => f.name.findName()),
            email: fake(f => f.internet.exampleEmail()),
            password: Bcrypt.hashSync('password')
            // created_at: fake((f) => f.date.recent(f.random.number())),
        }
    })(args)

export const administratorBuilder = (args?: any) =>
    build('User', {
        fields: {
            name: fake(f => f.name.findName()),
            email: fake(
                f => f.random.number() + '_' + f.internet.exampleEmail()
            ),
            password: Bcrypt.hashSync('password')
            // created_at: fake((f) => f.date.recent(f.random.number())),
        }
    })(args)

export const postBuilder = (args?: any) =>
    build('Post', {
        fields: {
            user_id: sequence(),
            title: fake(f => f.lorem.sentence()),
            approved: fake(f => f.random.boolean()),
            description: fake(f => f.lorem.sentence()),
            content: fake(f => f.lorem.sentence(10)),
            av_cpc: fake(f => f.random.number()),
            category: fake(f =>
                f.random.arrayElement(['angular', 'javascript', 'mysql', 'pg'])
            ),
            published_at: fake(f => f.date.past()),
            scheduled_for: fake(f => f.date.future())
            // created_at: fake((f) => f.date.recent(f.random.number())),
        }
    })(args)

export const tagsBuilder = (args?: any) =>
    build('Tag', {
        fields: {
            name: fake(f => f.lorem.sentence()),
            description: fake(f => f.lorem.sentence(10))
            // created_at: fake((f) => f.date.recent(f.random.number())),
        }
    })(args)

export const commentBuilder = (args?: any) =>
    build('Comment', {
        fields: {
            post_id: sequence(),
            title: fake(f => f.lorem.sentence()),
            body: fake(f => f.lorem.paragraph(2))
            // created_at: fake((f) => f.date.recent(f.random.number())),
        }
    })(args)

export const postsTagsBuilder = (args?: any) =>
    build('PostTag', {
        fields: {
            post_id: sequence(),
            tag_id: sequence()
            // created_at: fake((f) => f.date.recent(f.random.number())),
        }
    })(args)
