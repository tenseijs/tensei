require('dotenv').config()
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
} = require('@tensei/core')

tensei()
    .root(__dirname)
    .resources([
        resource('Post')
            .fields([
                text('Title').rules('required'),
                slug('Slug').from('Title'),
                textarea('Description').rules('required', 'max:255'),
                textarea('Content'),
                dateTime('Published At').rules('required'),
                belongsTo('Category'),
                array('Procedure')
                    .of('string')
                    .rules('required', 'min:3', 'max:10'),
                array('Prices')
                    .nullable()
                    .of('decimal')
                    .rules('required', 'max:10', 'min:2')
            ])
            .icon('library')
            .displayField('Title'),
        resource('Category')
            .fields([
                text('Name').notNullable().rules('required'),
                textarea('Description'),
                belongsTo('User').nullable(),
                hasMany('Post')
            ])
            .displayField('Name')
    ])
    .plugins([
        welcome(),
        cms().plugin(),
        auth().rolesAndPermissions().refreshTokens()
        // .cookieSessions()
        .plugin(),
        rest().plugin(),
        graphql().plugin(),
        manda().plugin()
    ])
    .databaseConfig({
        debug: true,
    })
    .start()
    .catch(console.error)
