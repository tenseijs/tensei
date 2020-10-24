const { text, textarea, resource, belongsTo } = require('@tensei/core')

module.exports = resource('Comment').fields([
    text('Title').rules('required').searchable(),
    textarea('Body').rules('required').hideOnIndex(),
    textarea('Reply').rules('required', 'max:255').hideOnIndex(),
    belongsTo('Post'),
])
