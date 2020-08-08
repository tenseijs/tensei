const {
    text,
    textarea,
    belongsTo,
    resource,
} = require('@flamingo/core')

module.exports = 

resource('Comment')
.fields([
    text('Title').rules('required'),
    textarea('Body').rules('required'),
    belongsTo('Post')
])
