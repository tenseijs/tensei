import Knex from 'knex'
import Faker from 'faker'
import Bcrypt from 'bcryptjs'
import Flamingo, { flamingo } from '../../Flamingo'

import Tag from './resources/Tag'
import Post from './resources/Post'
import User from './resources/User'
import Comment from './resources/Comment'

type ConfigureSetup = (app: Flamingo) => Flamingo

export const setup = async (configure?: ConfigureSetup) => {
    process.env.DATABASE = 'mysql'
    process.env.DATABASE_URI = 'mysql://root@127.0.0.1/testdb'

    let instance = flamingo()

    if (configure) {
        instance = configure(instance)
    }

    instance = await instance.resources([Post, Tag, User, Comment]).register()

    const knex: Knex = instance.databaseClient

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

    await knex('administrators').insert({
        name: user.name,
        email: user.email,
        password: Bcrypt.hashSync(user.password),
    })

    return user
}
