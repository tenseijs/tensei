require('dotenv').config()
const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { graphql } = require('@tensei/graphql')

const {
    tensei,
    welcome,
    resource,
    text,
    textarea,
    dateTime,
    slug,
    hasMany,
    belongsTo,
} = require('@tensei/core')

tensei()
    .root(__dirname)
    .resources([
        resource('Post')
            .fields([
                text('Title'),
                slug('Slug').from('Title'),
                textarea('Description'),
                textarea('Content'),
                dateTime('Published At'),
                belongsTo('Category')
            ])
            .displayField('Title'),
        resource('Category')
            .fields([
                text('Name').notNullable().rules('required'),
                textarea('Description'),
                hasMany('Post')
            ])
            .displayField('Name')
    ])
    .plugins([
        welcome(),
        cms().plugin(),
        auth().rolesAndPermissions()
        .cookieSessions()
        .plugin(),
        rest().plugin(),
        graphql().plugin()
    ])
    .databaseConfig({
        debug: true,
        forceUtcTimezone: true
    })
    .start()
    .catch(console.error)
