require('dotenv').config()
const { docs } = require('@tensei/docs')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, route } = require('@tensei/core')

const Tag = require('./resources/Tag')
const Post = require('./resources/Post')
const User = require('./resources/User')
const Editor = require('./resources/Editor')
const Comment = require('./resources/Comment')

module.exports = tensei()
    .dashboardPath('tensei')
    .resources([Tag, Post, User, Comment, Editor])
    .clientUrl('https://google.com')
    .serverUrl('http://localhost:5000')
    .defaultStorageDriver('local')
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
        auth()
            .user('Customer')
            .twoFactorAuth()
            .verifyEmails()
            .teams()
            .apiPath('auth')
            // .noCookies()
            .rolesAndPermissions()
            .social('github', {
                key: process.env.GITHUB_KEY,
                secret: process.env.GITHUB_SECRET,
                scope: ['user', 'user:email'],
            })
            .social('gitlab', {
                key: process.env.GITLAB_KEY,
                secret: process.env.GITLAB_SECRET,
            })
            .social('google', {
                key: process.env.GOOGLE_KEY,
                secret: process.env.GOOGLE_SECRET,
            })
            .social('linkedin', {
                key: process.env.LINKEDIN_KEY,
                secret: process.env.LINKEDIN_SECRET,
            })
            .plugin(),
        media().plugin(),
        graphql().plugin(),
        rest().plugin(),
        docs().plugin(),
    ])
    .db({
        type: process.env.DATABASE_TYPE || 'mysql',
        dbName: process.env.DATABASE_NAME || 'mikrotensei',
        debug: process.env.DEBUG === 'true' || false,
        user: process.env.DATABASE_USER || 'mikrotensei',
        password: process.env.DATABASE_PASSWORD || '',
    })
