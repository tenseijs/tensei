const { plugin } = require('@tensei/core')

module.exports = (config = {}) =>
    plugin('Stripe').setup(async ({ app, style, script }) => {
        console.log('-----> STRIPE PLUGIN CONFIG', config)

        return {}
    })
