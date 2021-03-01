const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { mailgun } = require('@tensei/mail')
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
    route
} = require('@tensei/core')

tensei()
    .root(__dirname)
    .mailer('transactions')
    .routes([
        route('Send mail via mailgun')
            .get()
            .path('/mailgun')
            .handle(async ({ mailer }, response) => {
                const result = await mailer.send(message => {
                    message
                        .from('no-reply@sandbox.mgsend.net', 'Emma at Mgsend')
                        .to('bahdcoder@gmail.com', 'Frantz Kati')
                        .subject(`Welcome to Crypto Hippo, Emily`)
                        .htmlView('mails/mailgun', {
                            user: 'Emily Myers'
                        })
                })

                response.json([])
            })
    ])
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
        mailgun('transactions').domain(process.env.MAILGUN_DOMAIN).plugin(),
        cms().plugin(),
        auth().rolesAndPermissions().plugin(),
        media().plugin(),
        rest().plugin(),
        graphql().plugin()
    ])
    .databaseConfig({
        type: 'sqlite',
        debug: true,
        dbName: 'tensei'
    })
    .start()
    .catch(console.error)
