const { Resource, ID } = require('@flamingo/core')

class User extends Resource {
    fields() {
        return [ID.make()]
    }
}

module.exports = User
