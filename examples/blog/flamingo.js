require('dotenv').config()
const { auth } = require('@flamingo/auth')
const { flamingo } = require('@flamingo/core')
const { trixTool } = require('@flamingo/trix')

module.exports = flamingo()
    .dashboardPath('nova')
    .resources([
        require('./resources/Post'),
        require('./resources/User'),
        require('./resources/Comment'),
        require('./resources/Tag'),
    ])
    .tools([auth().name('Customer').tool(), trixTool()])
