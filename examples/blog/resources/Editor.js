const { text, resource, hasOne } = require('@tensei/core')

const Editor = resource('Editor')
    .fields([
        text('Full name').searchable().rules('required'),
        hasOne('Post'),
        hasOne('Comment'),
    ])
    .displayField('Full name')

module.exports = Editor
