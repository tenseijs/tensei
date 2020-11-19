require('dotenv').config()
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { graphql } = require('@tensei/graphql')
const { tensei, plugin } = require('@tensei/core')

const Tag = require('./resources/Tag')
const Post = require('./resources/Post')
const User = require('./resources/User')
const Comment = require('./resources/Comment')

module.exports = tensei()
    .dashboardPath('tensei')
    .resources([Tag, Post, User, Comment])
    .clientUrl('https://google.com')
    .defaultStorageDriver('local')
    .plugins([
        auth()
            .user('Customer')
            .twoFactorAuth()
            .verifyEmails()
            .teams()
            .apiPath('auth')
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
        graphql().middlewareOptions({
            cors: {
                credentials: true,
                origin: ['http://localhost:3001']
            }
        }).plugin(),
        rest().plugin(),
        plugin('Custom Slug Validation').setup(({ indicative }) => {
            indicative.validator.extend('slug', {
                async: false,
                validate(data, field) {
                    return data.original[field].match(
                        /^[a-z0-9]+(?:-[a-z0-9]+)*$/
                    )
                },
            })
        }),
    ])
    .databaseConfig({
        type: 'mysql',
        dbName: 'mikrotensei',
        // debug: true,
        // user: 'mikrotensei',
        // password: 'password',
    })
