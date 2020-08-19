require('dotenv').config()
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
    .tools([trixTool()])
