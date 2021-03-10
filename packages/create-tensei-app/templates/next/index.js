const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { next } = require('@tensei/next')
const { media } = require('@tensei/media')
const { rest } = require('@tensei/rest')
const { tensei } = require('@tensei/core')

tensei()
    .root(__dirname)
    .plugins([
        cms().plugin(),
        media().plugin(),
        auth().plugin(),
        rest().plugin(),
        next().plugin()
    ])
    .start()
    .catch(console.error)
