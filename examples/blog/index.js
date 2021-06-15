require('dotenv').config()
const cors = require('cors')
const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { manda } = require('@tensei/manda')
const { graphql } = require('@tensei/graphql')

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
                textarea('Description').creationRules('required', 'max:255'),
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
            .displayField('Name')
    ])
    .plugins([
        welcome(),
        cms().plugin(),
        auth()
            .user('Customer')
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
        })  
    ])
    .db({
        debug: true,
        type: 'mongo',
        dbName: 'example_bloggg'
    })
    .start()
    .catch(console.error)
