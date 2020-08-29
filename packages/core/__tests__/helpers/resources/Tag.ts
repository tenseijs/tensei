import { text, resource, textarea, belongsToMany } from '@flamingo/common'

export default resource('Tag')
    .fields([
        text('Name')
            .rules('required')
            .searchable(),
        textarea('Description'),
        belongsToMany('Post')
    ])
    .displayField('name')
