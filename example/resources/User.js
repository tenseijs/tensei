const {
    Resource,
    ID,
    Text,
    BigInteger,
    Textarea,
    HasOne,
} = require('@flamingo/core')

class User extends Resource {
    fields() {
        return [
            ID.make(),
            Text.make('Email').unique().notNullable(),
            BigInteger.make('Followers').notNullable(),
            Textarea.make('Bio'),
            HasOne.make('Post'),
        ]
    }
}

module.exports = User
