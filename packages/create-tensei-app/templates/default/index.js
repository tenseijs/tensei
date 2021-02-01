const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { tensei } = require('@tensei/core')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')

tensei()
    .root(__dirname)
    .plugins([
        cms().plugin(),
        media().plugin(),
        auth().jwt().plugin(),
        graphql().plugin()
    ])
    .start()
    .catch(console.error)
