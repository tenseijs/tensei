const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, welcome } = require('@tensei/core')

tensei()
    .root(__dirname)
    .routes([welcome()])
    .plugins([
        cms().plugin(),
        media().plugin(),
        auth().plugin(),
        graphql().plugin()
    ])
    .start()
    .catch(console.error)
