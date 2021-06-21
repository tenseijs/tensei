require('dotenv').config()
const cors = require('cors')
const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { manda } = require('@tensei/manda')
const { graphql } = require('@tensei/graphql')
const { mde, markdown } = require('@tensei/mde')

const {
    tensei,
    welcome,
    resource,
    text,
    textarea,
    dateTime,
    slug,
    array,
    hasMany,
    belongsTo,
    plugin,
    boolean,
} = require('@tensei/core')

tensei()
    .root(__dirname)
    .resources([
        resource('Post')
            .fields([
                text('Title').rules('required'),
                slug('Slug').creationRules('required', 'unique:slug').unique().from('Title'),
                markdown('Description').creationRules('required', 'max:255'),
                textarea('Content').nullable().rules('required'),
                dateTime('Published At').creationRules('required'),
                belongsTo('Category').alwaysLoad(),
                array('Procedure')
                    .of('string')
                    .rules('min:3', 'max:10')
                    .creationRules('required'),
                array('Prices')
                    .nullable()
                    .of('decimal')
                    .rules('max:10', 'min:2')
                    .creationRules('required')
            ])
            .icon('library')
            .displayField('Title'),
        resource('Category')
            .fields([
                text('Name').notNullable().rules('required'),
                textarea('Description'),
                belongsTo('Customer').nullable(),
                hasMany('Post')
            ])
            .disableAutoFilters()
            .displayField('Name')
    ])
    .plugins([
        welcome(),
        cms().plugin(),
        auth()
            .user('Customer')
            .verifyEmails()
            .twoFactorAuth()
            .social('google', {
                key: '76952592334-85on1sgp53df4a1l8lm99n51lg71j7jr.apps.googleusercontent.com',
                secret: 'JQWpDn95Mv1OnmlUZcR1i9ex',
                clientCallback: 'http://localhost:1334/'
            })
            .configureTokens({
                accessTokenExpiresIn: 60,
                refreshTokenExpiresIn: 240
            })
            .setup(({ user }) => {
                user.fields([
                    hasMany('Category'),
                    boolean('Accepted Terms And Conditions').rules('required').default(false)
                ])
            })
            .rolesAndPermissions().refreshTokens()
        // .cookieSessions()
        .plugin(),
        rest().plugin(),
        graphql().plugin(),
        manda().plugin(),
        plugin('Cors').register(({ app }) => {
            app.use(cors())
        }),
        mde().plugin()
    ])
    .db({
        debug: true,
        type: 'mongo',
        dbName: 'example_blogggg'
    })
    .start()
    .catch(console.error)
