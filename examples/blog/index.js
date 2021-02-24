const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { media } = require('@tensei/media')
const { billing, plan } = require('@tensei/hades')
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
        billing()
            .plans([
                plan('Standard')
                    .monthly('8486')
                    .yearly('8487')
                    .description('Get to enjoy the most basic features of Tensei')
                    .features([
                        'Unlimited message archive',
                        'Unlimited apps',
                        'Group video calls with screen sharing'
                    ])
                    .yearlyIncentive('Save 80% on the yearly plan.'),
                plan('Premium')
                    .monthly('8486')
                    .yearly('8487')
                    .description('Powerful lift off of Tensei')
                    .features([
                        'Unlimited message archive',
                        'Unlimited apps',
                        'Group video calls with screen sharing',
                        '99.99% guaranteed uptime SLA',
                        'User provisioning and deprovisioning',
                        'SAML-based single sign-on (SSO)',
                        'Data exports for all messages',
                    ])
            ])
        .plugin()
    ])
    .databaseConfig({
        type: 'sqlite',
        debug: process.env.DEBUG,
        dbName: 'tensei'
    })
    .start()
    .catch(console.error)
