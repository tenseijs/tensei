const { plugin } = require('@tensei/core')

module.exports = (config = {}) =>
    plugin('Stripe').register(async ({ app, style, script }) => {
        console.log('-----> STRIPE PLUGIN CONFIG', config)

        return {}
    })
