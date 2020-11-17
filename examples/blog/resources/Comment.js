const { text, textarea, resource, belongsTo, filter } = require('@tensei/core')

module.exports = resource('Comment')
    .fields([
        text('Title').rules('required').searchable(),
        textarea('Body').rules('required').hideOnIndex(),
        textarea('Reply').rules('required', 'max:255').hideOnIndex(),
        belongsTo('Post'),
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
