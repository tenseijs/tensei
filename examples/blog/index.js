const { flamingo } = require('@flamingo/core')
const { graphql } = require('@flamingo/graphql')
const { trixTool } = require('@flamingo/trix')

process.env.DATABASE = 'mysql'

flamingo()
    .dashboardPath('nova')
    .resources([
        require('./resources/Post'),
        require('./resources/User'),
        require('./resources/Comment'),
    ])
    .tools([trixTool()])
    .register()
    .then(({ app }) => {
        app.listen(3455, () => {
            console.log('BOOOOM ! WORKING ON http://localhost:3455')
        })
    })
