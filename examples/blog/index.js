const Express = require('express')

require('./app')
    .register()
    .then(async ({ app }) => {
        app.listen(5000, () => {
            console.log('BOOOOM ! WORKING ON http://localhost:5000')
        })
    })
