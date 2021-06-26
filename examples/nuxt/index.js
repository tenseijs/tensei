const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { nuxt } = require('@tensei/nuxt')

const {
    tensei,
    resource,
    slug,
    text,
    textarea,
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
        auth().twoFactorAuth().verifyEmails().plugin(),
        rest().plugin(),
        nuxt().plugin(),
    ])
    .databaseConfig({
        type: 'mongo',
        dbName: 'tensei'
    })
    .start()
    .catch(console.error)
