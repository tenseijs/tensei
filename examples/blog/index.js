require('dotenv').config()
const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, welcome, select, text, resource, slug, boolean, belongsTo, timestamp, hasMany } = require('@tensei/core')

tensei()
    .root(__dirname)
    .resources([
        resource('Track')
            .hideOnInsertApi()
            .hideOnUpdateApi()
            .hideOnDeleteApi()
            .fields([
                text('Name'),
                hasMany('Assignment'),
                slug('Slug').from('Name'),
                boolean('Open To Enrolments').default(true),
            ]).displayField('Name'),
        resource('Enrolment')
            .hideOnInsertApi()
            .hideOnDeleteApi()
            // .filters([
            //     filter('Owner')
            //         .fields([
            //             text('Slug'),
            //             boolean('Published')
            //         ])
            //         .condition(fields => ({ user: { id: { $eq: fields.slug } } }))
            //         .default()
            // ])
            .fields([
                belongsTo('User'),
                belongsTo('Track'),
            ]),
        resource('Invite')
            .hideOnInsertApi()
            .hideOnUpdateApi()
            .hideOnDeleteApi()
            .fields([
                text('Email').rules('email', 'required'),
                belongsTo('Track'),
                timestamp('Expires At'),
            ]).displayField('Email'),
        resource('Assignment')
            .hideOnInsertApi()
            .hideOnUpdateApi()
            .hideOnDeleteApi()
            .fields([
                text('Repository Prefix').notNullable(),
                text('Title'),
                text('Description'),
                belongsTo('Track'),
                hasMany('Submission'),
                text('Template Repository'),
                text('Pull Request Template'),
                boolean('Initial Pull Request'),
            ]).displayField('Title'),
        resource('Submission')
            .hideOnInsertApi()
            .hideOnUpdateApi()
            .hideOnDeleteApi()
            .fields([
                belongsTo('User'),
                belongsTo('Track'),
                belongsTo('Assignment'),
                text('Repository'),
                boolean('Completed'),
                belongsTo('User', 'reviewer').label('Reviewer')
            ])
            .displayField('Repository')
    ])
    .plugins([
        welcome(),
        cms().plugin(),
        media().plugin(),
        auth()
        .configureTokens({
            accessTokenExpiresIn: 60 * 60 * 60 * 24
        })
        .setup(({ user }) => {
            user.fields([
                text('Avatar').nullable(),
                select('Role').options(['Student', 'Reviewer']).nullable()
            ])
        }).social('github', {
            key: process.env.GITHUB_API_KEY,
            secret: process.env.GITHUB_API_SECRET,
            scope: ['user', 'repo'],
            clientCallback: 'http://localhost:3000/auth'
        }).plugin(),
        graphql().plugin()
    ])
    .register(({ getQuery }) => {
        getQuery('enrolments')
            .authorize((ctx) => !!ctx.user && ctx.body?.where?.user?.id?._eq === ctx.user.id.toString())
    })
    .start()
    .catch(console.error)
