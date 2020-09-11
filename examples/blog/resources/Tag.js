const { text, resource, textarea, belongsToMany } = require('@tensei/core')

module.exports = resource('Tag')
    .fields([
        text('Name').rules('required').searchable(),
        textarea('Description').hideOnIndex(),
        belongsToMany('Post'),
    ])
    .displayField('name')
