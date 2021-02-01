require('dotenv').config()
const { cms } = require('@tensei/cms')
const { mde } = require('@tensei/mde')
const { rest } = require('@tensei/rest')
const { media } = require('@tensei/media')
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
        cms().plugin(),
        media().graphql().maxFileSize(500000000000).plugin(),
        graphql().plugin(),
        rest().plugin(),
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
