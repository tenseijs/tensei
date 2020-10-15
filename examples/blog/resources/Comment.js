const {
    text,
    textarea,
    resource,
    // belongsToMongo: belongsTo,
    belongsTo,
} = require('@tensei/core')

module.exports = resource('Comment').fields([
    text('Title').rules('required').searchable(),
    textarea('Body').rules('required').hideOnIndex(),
    belongsTo('Post'),
])
