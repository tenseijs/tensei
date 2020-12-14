const { file, files } = require('@tensei/media')
const { select, resource, belongsTo } = require('@tensei/core')

module.exports = resource('Reaction').fields([
    select('Type')
        .options([
            { label: 'Heart', value: 'heart' },
            { label: 'Downvote', value: 'downvote' },
        ])
        .nullable(),
    file('Icon'),
    files('OS Specific Icons'),
    belongsTo('Comment'),
])
