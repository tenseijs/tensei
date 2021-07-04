const { cms } = require('@tensei/cms')
const { auth } = require('@tensei/auth')
const { nuxt } = require('@tensei/nuxt')
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
    nuxt().plugin()
  ])
  .start()
  .catch(console.error)
