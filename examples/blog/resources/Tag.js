const {
    text,
    resource,
    textarea,
    belongsToMany
} = require('@flamingo/core')

module.exports =
resource('Tag')
.fields([
    text('Name').rules('required').searchable(),
    textarea('Description'),
    belongsToMany('Post')
])
.displayField('name')
