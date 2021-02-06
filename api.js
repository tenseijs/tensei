const { cms } = require('@tensei/cms')
const { media } = require('@tensei/media')
const { graphql } = require('@tensei/graphql')
const { tensei, resource, text, textarea, } = require('@tensei/core')

process.env.DEBUG = true

module.exports = tensei()
    .resources([
        resource('Tag')
            .fields([
                text('Name')
                    .creationRules('required')
                    .updateRules('min:25')
                    .searchable(),
                textarea('Description')
                    .hideOnIndex(),
            ])
            .displayField('Name'),
        resource('Post')
            .fields([
                text('Title')
                    .rules('required', 'max:255', 'min:25')
                    .searchable()
                    .sortable()
            ])
    ]).plugins([
        cms()
            .plugin(),
        media()
            .graphql()
            .plugin(),
        graphql()
            .plugin(),
    ])
