require('./flamingo')
    .register()
    .then(({ app }) => {
        app.listen(5000, () => {
            console.log('BOOOOM ! WORKING ON http://localhost:5000')
        })
    })
