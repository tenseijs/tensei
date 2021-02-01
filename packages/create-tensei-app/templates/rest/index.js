const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { tensei } = require('@tensei/core')
const { media } = require('@tensei/media')

tensei()
    .root(__dirname)
    .plugins([
        cms().plugin(),
        media().plugin(),
        auth().jwt().plugin(),
        rest().plugin()
    ])
    .start()
    .catch(console.error)
