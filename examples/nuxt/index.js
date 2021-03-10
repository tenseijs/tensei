const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { nuxt } = require('@tensei/nuxt')

const {
    tensei,
    resource,
    slug,
    text,
    textarea,
    dateTime,
    belongsTo,
    hasMany
} = require('@tensei/core')

tensei()
    .root(__dirname)
    .mailer('transactions')
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
        auth()
            .cookieSessions()
            .plugin(),
        rest().plugin(),
        nuxt().plugin(),
    ])
    .databaseConfig({
        type: 'sqlite',
        dbName: 'tensei'
    })
    .start()
    .catch(console.error)
