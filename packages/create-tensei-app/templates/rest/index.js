const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { rest } = require('@tensei/rest')
const { media } = require('@tensei/media')
const { tensei, welcome } = require('@tensei/core')

tensei()
    .root(__dirname)
    .plugins([
        welcome(),
        cms().plugin(),
        media().plugin(),
        auth().plugin(),
        rest().plugin()
    ])
    .start()
    .catch(console.error)
