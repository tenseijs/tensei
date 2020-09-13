require('dotenv').config()
const { auth } = require('@tensei/auth')
const { tensei } = require('@tensei/core')
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
    .plugins([
        // auth().name('Customer').twoFactorAuth().plugin(),
        // trix(),
        // cashier()
        //     .customerResourceName('Customer')
        //     .cardUpfront()
        //     .plans([
        //         plan('Basic Sub').monthly().price(29),
        //         plan('Premium Sub').yearly().price(99),
        //     ])
        //     .plugin(),
    ])
    .databaseConfig({
        // client: 'mysql',
        // connection: {
        //     host: '127.0.0.1',
        //     user: 'root',
        //     pass: '',
        //     database: 'flmg',
        // },
        client: 'sqlite3',
        connection: './blog.sqlite',
        useNullAsDefault: true,
        debug: false,
    })
