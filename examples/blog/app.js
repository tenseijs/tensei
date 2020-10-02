require('dotenv').config()
const { auth } = require('@tensei/auth')
const { graphql } = require('@tensei/graphql')
const { trixPlugin: trix } = require('@tensei/trix')
const { cashier, plan } = require('@tensei/cashier')
const { tensei, dashboard, valueMetric } = require('@tensei/core')

const Tag = require('./resources/Tag')
const Post = require('./resources/Post')
const User = require('./resources/User')
const Comment = require('./resources/Comment')

module.exports = tensei()
    .dashboardPath('tensei')
    .resources([Tag, Post, User, Comment])
    .database('mysql')
    .dashboards([
        dashboard('Main').cards([
            valueMetric('New Tags')
                .width('1/3')
                .styles({
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'right',
                    color: '#fff',
                    backgroundImage: 'linear-gradient(-45deg,#014ba7,#0183d0)',
                })
                .selectStyles({
                    backgroundColor: '#fff',
                    color: '#000',
                })
                .compute((_this) => _this.count(Tag)),
            valueMetric('Posts Av CPC')
                .width('2/3')
                .bgImage(
                    'https://prium.github.io/falcon/v2.7.2/default/assets/img/illustrations/corner-1.png'
                )
                .styles({
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'right',
                })
                .compute((_this) => _this.avg(Post, 'av_cpc')),
            valueMetric('New Users')
                .width('1/3')
                .compute((_this) => _this.count(User)),
            valueMetric('Least av cpc')
                .width('1/3')
                .compute((_this) => _this.min(Post, 'av_cpc')),
            valueMetric('Highest AV CPC')
                .width('1/3')
                .compute((_this) => _this.max(Post, 'av_cpc')),
        ]),
    ])
    .plugins([
        auth()
            .name('Customer')
            .twoFactorAuth()
            .verifyEmails()
            .teams()
            .apiPath('auth')
            .rolesAndPermissions()
            .social('github', {
                key: 'fe70f4adef103b95d58d',
                secret: '20af95da2d79cbde357ac739e6f7e588fc13fc63',
                scope: ['user', 'user:email'],
                response: ['raw', 'tokens', 'jwt']
            })
            .social('twitter', {
                key: 'cpKhfpZr3aYokVhJXPRxvwya9',
                secret: 'dZCpuEoTJxAiIgVgVpdPORoCPvdF9pAddsQ8sV8oQ3AlnnAffa'
            })
            .social('gitlab', {
                key: 'be9855c70e85496e7d5281793ae96dda5c3e0558a5870dfc1d585ead3f7ced3c',
                secret: 'e6bfcce12fdeac1b8bd7a397de8fe39b98f6b1b39b0228fcd349796fe749d00c',
                // scope: ['api', 'read_user', 'read_api', 'read_repository', 'write_repository'],
                redirect_uri: 'http://localhost:5000/auth/github/callback'
            })
            .plugin(),
        trix(),
        cashier()
            .customerResourceName('Customer')
            .cardUpfront()
            .plans([
                plan('Basic Sub').monthly().price(29),
                plan('Premium Sub').yearly().price(99),
            ])
            .plugin(),
        graphql().plugin(),
    ])
    // .databaseConfig('mongodb://localhost/tensei', {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    // })
    .databaseConfig({
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            pass: '',
            database: 'flmg',
        },
        // client: 'sqlite3',
        // connection: './blog.sqlite',
        // useNullAsDefault: true,
        // debug: false,
        // client: 'pg',
        // connection: {
        //     host: '127.0.0.1',
        //     user: 'root',
        //     pass: '',
        //     database: 'tensei',
        // },
    })
