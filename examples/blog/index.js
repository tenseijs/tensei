const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, welcome, resource, text, textarea, dateTime, slug, hasMany, belongsTo } = require('@tensei/core')

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
        auth().rolesAndPermissions().plugin(),
        media().plugin(),
        graphql().plugin(),
    ])
    .databaseConfig({
        type: 'sqlite',
        debug: true,
        dbName: 'tensei'
    })
    .start()
    .catch(console.error)
