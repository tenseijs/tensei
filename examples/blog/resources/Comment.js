const {
    text,
    textarea,
    belongsTo,
    resource,
} = require('@flamingo/core')

module.exports = 

resource('Comment')
.fields([
    text('Title'),
    textarea('Body'),
    belongsTo('Post')
])
