const { flamingo } = require('@flamingo/core')

flamingo(__dirname)
    .start()
    .catch(console.error)
