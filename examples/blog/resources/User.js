const {
    dateTime,
    integer,
    text,
    textarea,
    date,
    belongsTo,
    select,
    resource,
    password
} = require('@flamingo/core')

const User = resource('User')
.fields([
    text('Full name'),
    text('Email')
        .unique()
        .searchable(),
    password('Password')
    .notNullable()
])

module.exports = User
