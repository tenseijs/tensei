require('dotenv').config()
const { auth } = require('@tensei/auth')
const { tensei, dashboard, card, valueMetric } = require('@tensei/core')
const { graphql } = require('@tensei/graphql')
const { trixPlugin: trix } = require('@tensei/trix')
const { cashier, plan } = require('@tensei/cashier')

module.exports = tensei()
    .dashboardPath('nova')
    .resources([
        require('./resources/Post'),
        require('./resources/User'),
        require('./resources/Comment'),
        require('./resources/Tag'),
    ])
    .dashboards([
        dashboard('Main').cards([
            valueMetric('New Tags').width('1/3'),
            valueMetric('New Users').width('1/3'),
            valueMetric('New Posts').width('1/3'),
            valueMetric('New Comments').width('1/3'),
        ]),
    ])
    .plugins([
        auth().name('Customer').twoFactorAuth().verifyEmails().plugin(),
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
    .databaseConfig({
        // client: 'mysql',
        // connection: {
        //     host: '127.0.0.1',
        //     user: 'root',
        //     pass: '',
        //     database: 'flmg',
        // },
        // client: 'sqlite3',
        // connection: './blog.sqlite',
        // useNullAsDefault: true,
        // debug: false,
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            pass: '',
            database: 'tensei',
        },
    })
