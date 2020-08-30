require('dotenv').config()
const { auth } = require('@tensei/auth')
const { tensei } = require('@tensei/core')
const { trixTool: trix } = require('@tensei/trix')
const { cashier, plan } = require('@tensei/cashier')

module.exports = tensei()
    .dashboardPath('nova')
    .resources([
        require('./resources/Post'),
        require('./resources/User'),
        require('./resources/Comment'),
        require('./resources/Tag'),
    ])
    .tools([
        auth().name('Customer').twoFactorAuth().tool(),
        trix(),
        cashier()
            .customerResourceName('Customer')
            .cardUpfront()
            .plans([
                plan('Basic Sub').monthly().price(29),
                plan('Premium Sub').yearly().price(99),
            ])
            .tool(),
    ])
    .database(process.env.DATABASE || 'mysql')
    .databaseUrl(process.env.DATABASE_URL || 'mysql://127.0.0.1/flmg')
