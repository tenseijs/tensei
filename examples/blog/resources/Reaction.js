const { select, resource, belongsTo } = require('@tensei/core')

module.exports = resource('Reaction').fields([
    select('Type')
        .options([
            { label: 'Heart', value: 'heart' },
            { label: 'Downvote', value: 'downvote' },
        ])
        .nullable(),
    belongsTo('Comment'),
])
