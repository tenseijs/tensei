const tensei = require('./app')

tensei.register().then(async ({ app }) => {
    app.listen(5500, () => {
        console.log('BOOOOM ! WORKING ON http://localhost:5500')
    })
})
