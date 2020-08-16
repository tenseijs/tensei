const {
    text,
    textarea,
    belongsTo,
    resource,
} = require('@flamingo/core')

module.exports = 

resource('Comment')
.fields([
    text('Title').rules('required').searchable(),
    textarea('Body').rules('required').hideFromIndex(),
    belongsTo('Post')
])
