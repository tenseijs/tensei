import 'dotenv/config'
import { docs } from '@tensei/docs'
import { auth } from '@tensei/auth'
import { rest } from '@tensei/rest'
import { graphql } from '@tensei/graphql'
import { tensei, plugin, route, SupportedDatabases } from '@tensei/core'

import Tag from './resources/Tag'
import Post from './resources/Post'
import User from './resources/User'
import CommentResource from './resources/Comment'

module.exports = tensei()
    .dashboardPath('tensei')
    .resources([Tag, Post, User, CommentResource])
    .clientUrl('https://google.com')
    .serverUrl('http://localhost:5000')
    .defaultStorageDriver('local')
    .routes([
        route('Get products')
            .get()
            .path('/products')
            .extend({
                docs: {
                    tags: ['Products']
                }
            })
            .handle(async (req, res) =>
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
            .rolesAndPermissions()
            .configureTokens({
                accessTokenExpiresIn: 60,
                refreshTokenExpiresIn: 60 * 2,
            })
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
        graphql()
            .middlewareOptions({
                cors: {
                    credentials: true,
                    origin: ['http://localhost:3001'],
                },
            })
            .plugin(),
        rest().plugin(),
        docs()
        .plugin(),
        plugin('Custom Slug Validation').register(async ({ indicative }) => {
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
        type: (process.env.DATABASE_TYPE || 'mysql') as SupportedDatabases,
        dbName: process.env.DATABASE_NAME || 'mikrotensei',
        // @ts-ignore
        debug: process.env.DEBUG || false,
        user: process.env.DATABASE_USER || 'mikrotensei',
        password: process.env.DATABASE_PASSWORD || '',
    })
