const { text, resource, textarea, belongsToMany } = require('@tensei/core')

module.exports = resource('Tag')
    .fields([
        text('Name').rules('required').searchable(),
        textarea('Description').hideFromIndex(),
        belongsToMany('Post'),
    ])
    .displayField('name')
