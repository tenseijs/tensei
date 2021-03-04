import { text, resource, textarea, belongsToMany, number } from '@tensei/common'

export default resource('Tag')
    .fields([
        text('Name')
            .rules('required')
            .searchable(),
        number('Priority')
            .nullable()
            .default(1)
            .rules('integer', 'under:5'),
        textarea('Description'),
        belongsToMany('Post')
    ])
    .displayField('Name')
