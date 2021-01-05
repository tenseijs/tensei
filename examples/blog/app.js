require('dotenv').config()
const { mde } = require('@tensei/mde')
const { rest } = require('@tensei/rest')
const { auth } = require('@tensei/auth')
const { media } = require('@tensei/media')
const { ses, smtp } = require('@tensei/mail')
const { graphql } = require('@tensei/graphql')
const { tensei, route } = require('@tensei/core')

const Tag = require('./resources/Tag')
const Post = require('./resources/Post')
const User = require('./resources/User')
const Editor = require('./resources/Editor')
const Comment = require('./resources/Comment')
const Reaction = require('./resources/Reaction')

module.exports = tensei()
    .root(__dirname)
    .resources([Tag, Post, User, Comment, Editor, Reaction])
    .clientUrl('https://google.com')
    .serverUrl('http://localhost:5000')
    .graphQlQueries([])
    .routes([
        route('Get products')
            .get()
            .path('/products')
            .extend({
                docs: {
                    tags: ['Products'],
                },
            })
            .handle((req, res) =>
                res.formatter.ok({
                    name: 'Product 1',
                })
            ),
    ])
    .plugins([
        media().graphql().plugin(),
        graphql()
            .middlewareOptions({
                cors: {
                    credentials: true,
                    origin: ['http://localhost:3001'],
                },
            })
            .plugin(),
        rest().plugin(),
        ses('transactional')
            .region('us-east-1')
            .key('AKIAYCA6IR7CT27KWF7T')
            .secret('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')
            .plugin(),
        smtp('mailtrap')
            .host('smtp.mailtrap.io')
            .user('df3db2ece4f0e4')
            .pass('b0adaac4573cd9')
            .port(2525)
            .plugin(),
        mde().plugin(),
    ])
    .db({
        type: process.env.DATABASE_TYPE || 'mysql',
        dbName: process.env.DATABASE_NAME || 'mikrotensei',
        debug: process.env.DEBUG === 'true' || false,
        user: process.env.DATABASE_USER || 'mikrotensei',
        password: process.env.DATABASE_PASSWORD || '',
    })
    .boot(({ routes }) => {
        // routes.forEach(r => console.log(r.config.path, r.config.id, r.config.authorize.length))
    })
