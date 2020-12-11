const {
    text,
    textarea,
    resource,
    belongsTo,
    filter,
    hasOne,
} = require('@tensei/core')

module.exports = resource('Comment')
    .fields([
        text('Title').rules('required').searchable(),
        textarea('Body').rules('required').hideOnIndex(),
        textarea('Reply').rules('required', 'max:255').hideOnIndex(),
        belongsTo('Post'),
        hasOne('Editor'),
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
