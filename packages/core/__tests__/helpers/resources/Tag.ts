import { text, resource, textarea, belongsToMany } from '@tensei/common'

export default resource('Tag')
    .fields([
        text('Name').rules('required').searchable(),
        textarea('Description'),
        belongsToMany('Post'),
    ])
    .displayField('name')
