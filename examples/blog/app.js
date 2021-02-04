require('dotenv').config()
const { cms } = require('@tensei/cms')
const { mde } = require('@tensei/mde')
const { smtp } = require('@tensei/mail')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, route, welcome } = require('@tensei/core')

const Tag = require('./resources/Tag')
const Post = require('./resources/Post')
const User = require('./resources/User')
const Editor = require('./resources/Editor')
const Comment = require('./resources/Comment')
const Reaction = require('./resources/Reaction')

module.exports = tensei()
    .name('Roadmapped.dev')
    .root(__dirname)
    .resources([Tag, Post, User, Comment, Editor, Reaction])
    .clientUrl('https://google.com')
    .graphQlQueries([])
    .routes([welcome()])
    .plugins([
        cms().plugin(),
        media().graphql().maxFileSize(500000000000).plugin(),
        auth().user('Customer').twoFactorAuth().plugin(),
        graphql().plugin(),
        mde().plugin(),
        rest().plugin(),
        smtp('mailtrap')
            .user('df3db2ece4f0e4')
            .pass('b0adaac4573cd9')
            .host('smtp.mailtrap.io')
            .port(2525)
            .plugin(),
    ])
    .mailer('mailtrap')
    .databaseConfig({
        type: process.env.DATABASE_TYPE || 'mysql',
        dbName: process.env.DATABASE_NAME || 'mikrotensei',
        debug: process.env.DEBUG === 'true' || false,
        user: process.env.DATABASE_USER || 'mikrotensei',
        password: process.env.DATABASE_PASSWORD || '',
    })
