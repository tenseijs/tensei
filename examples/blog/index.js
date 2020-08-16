require('./flamingo')
    .register()
    .then(({ app, databaseClient }) => {
        app.listen(3455, () => {
            console.log('BOOOOM ! WORKING ON http://localhost:3455')
        })
    })
