const Path = require('path')
const stripe = require('./tools/stripe')
const { flamingo } = require('@flamingo/core')
const { graphql } = require('@flamingo/graphql')

// process.env.DATABASE_URL = Path.resolve(__dirname, 'db.sqlite')
process.env.DATABASE = 'mysql'

flamingo()
.dashboardPath('nova')
.resources([
    require('./resources/Post'),
    require('./resources/User'),
    require('./resources/Comment'),
])
.tools([
    graphql()
])
.register()
.then(({ app }) => {
    app.listen(3455, () => {
        console.log('BOOOOM ! WORKING ON http://localhost:3455')
    })
})
