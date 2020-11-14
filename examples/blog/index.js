const tensei = require('./app')

tensei
    .register()
    .then(async ({ app }) => {
        app.listen(5000, () => {
            console.log('BOOOOM ! WORKING ON http://localhost:5000')
        })
    })
    .catch(console.error)
