const { flamingo } = require('@flamingo/core')

// flamingo(__dirname).resour.start().catch(console.error)
// flamingo().start

flamingo()
    .resources([
        require('./resources/Post'),
        // require('./resources/User'),
        // require('./resources/Comment'),
    ])

// flamingo()
//     .resources([
//         flamingo.resource(),
//         flamingo.resource(),
//         flamingo.resource(),
//         flamingo.resource(),
//         flamingo.resource(),
//         flamingo
//             .resource()
//             .fields([]),
//     ])
