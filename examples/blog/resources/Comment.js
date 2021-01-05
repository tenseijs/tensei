const {
    text,
    textarea,
    resource,
    belongsTo,
    filter,
    hasOne,
    hasMany,
} = require('@tensei/core')

module.exports = resource('Comment')
    .displayField('Title')
    .fields([
        text('Title').rules('required').searchable().sortable(),
        textarea('Body').rules('required').hideOnIndex(),
        textarea('Reply')
            .rules('required', 'max:255')
            .hideOnIndex()
            .alwaysShow(),
        belongsTo('Post'),
        hasOne('Editor'),
        hasMany('Reaction'),
    ])
    .filters([
        filter('Comments on Post')
            .dashboardView()
            .query((args) => ({
                post: {
                    id: args.id,
                },
            })),
    ])
