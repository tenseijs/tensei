const { tool } = require('@tensei/core')

module.exports = (config = {}) =>
    tool('Stripe').setup(async ({ app, style, script }) => {
        console.log('-----> STRIPE TOOL CONFIG', config)

        return {}
    })
