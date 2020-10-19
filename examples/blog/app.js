require('dotenv').config()
const { auth } = require('@tensei/auth')
const { graphql } = require('@tensei/graphql')
const { trixPlugin: trix } = require('@tensei/trix')
const { cashier, plan } = require('@tensei/cashier')
const { AmazonWebServicesS3Storage } = require('@slynova/flydrive-s3')
const { tensei, dashboard, valueMetric, plugin } = require('@tensei/core')

const Tag = require('./resources/Tag')
const Post = require('./resources/Post')
const User = require('./resources/User')
const Comment = require('./resources/Comment')

module.exports = tensei()
    .dashboardPath('tensei')
    .resources([Tag, Post, User, Comment])
    .database('mongodb')
    .serverUrl('http://localhost:5000')
    .clientUrl('https://google.com')
    .defaultStorageDriver('local')
    .storageDriver(
        's3',
        {
            key: process.env.AWS_KEY,
            secret: process.env.AWS_SECRET,
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_BUCKET,
        },
        AmazonWebServicesS3Storage
    )
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
                key: process.env.GITHUB_KEY,
                secret: process.env.GITHUB_SECRET,
                scope: ['user', 'user:email'],
            })
            .social('gitlab', {
                key: process.env.GITLAB_KEY,
                secret: process.env.GITLAB_SECRET,
            })
            .social('google', {
                key: process.env.GOOGLE_KEY,
                secret: process.env.GOOGLE_SECRET,
            })
            .social('linkedin', {
                key: process.env.LINKEDIN_KEY,
                secret: process.env.LINKEDIN_SECRET,
            })
            .plugin(),
        trix(),
        // cashier()
        //     .customerResourceName('Customer')
        //     .cardUpfront()
        //     .plans([
        //         plan('Basic Sub').monthly().price(29),
        //         plan('Premium Sub').yearly().price(99),
        //     ])
        //     .plugin(),
        graphql().plugin(),
        plugin('Custom Slug Validation').setup(
            ({ indicative }) => {
                indicative.validator.extend('slug', {
                    async: false,
                    validate(data, field, args, config) {
                        return data.original[field].match(
                            /^[a-z0-9]+(?:-[a-z0-9]+)*$/
                        )
                    },
                })
            }
        ),
    ])
    .databaseConfig('mongodb://localhost/tensei-y', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
// .databaseConfig({
//     client: 'mysql',
//     connection: {
//         host: '127.0.0.1',
//         user: 'root',
//         pass: '',
//         database: 'flmg',
//     },
//     debug: true,
// })
