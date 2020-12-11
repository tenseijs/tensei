require('dotenv').config()
const { auth } = require('@tensei/auth')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, resource, text, textarea, belongsTo, bigInteger, hasMany, plugin } = require('@tensei/core')

tensei()
    .plugins([
        auth()
            .rolesAndPermissions()
            .setup(({ user }) => {
                user.fields([
                    hasMany('Discussion'),
                    hasMany('Comment'),
                    belongsTo('Tenant')
                        .rules('required')
                ])
            })
            .social('github', {
                key: process.env.GITHUB_KEY,
                secret: process.env.GITHUB_SECRET,
                scope: ['user', 'user:email'],
            })
            .plugin(),
        media()
            .plugin(),
        graphql()
            .plugin(),
        plugin('Authorize discussions')
            .boot(({ graphQlQueries }) => {
                const insert_discussion = graphQlQueries.find(query => query.config.path === 'insert_discussion')

                insert_discussion.authorize(async ({ body, manager, user }) => {
                    await manager.populate([user], 'tenant')

                    if (! body.object.user || ! body.object.tenant) {
                        return false
                    }

                    if (body.object.user.toString() !== user.id.toString()) return false

                    if (body.object.tenant.toString() !== user.tenant.id) return false

                    return true
                })
            }),
    ])
    .resources([
        resource('Tenant')
            .fields([
                text('Name')
                    .rules('required', 'unique:name'),
                text('Slug')
                    .rules('required', 'unique:slug')
            ]),
        resource('Reaction')
            .fields([
                text('Name')
            ]),
        resource('Category')
            .fields([
                text('Name')
                    .rules('required'),
                text('Emoji Name')
                    .rules('required'),
                hasMany('Discussion'),
            ]),
        resource('Comment')
            .fields([
                textarea('Content')
                    .rules('required'),
                belongsTo('Discussion')
                    .rules('required'),
                belongsTo('User')
                    .rules('required'),
                hasMany('Reaction'),
            ]),
        resource('Discussion')
            .fields([
                text('Title')
                    .searchable(),
                textarea('Content')
                    .searchable(),
                belongsTo('User')
                    .notNullable()
                    .rules('required'),
                belongsTo('Tenant')
                    .rules('required'),
                hasMany('Reaction'),
                bigInteger('Views')
                    .nullable()
                    .default(0),
            ])
    ])
    .db({
        type: 'sqlite',
        dbName: 'tensei_fluxx.sqlite',
    })
    .start()
