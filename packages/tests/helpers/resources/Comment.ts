import { text, belongsTo, resource, textarea } from '@tensei/common'

export default resource('Comment').fields([
    text('Title').rules('required').searchable(),
    textarea('Body').rules('required'),
    belongsTo('Post')
])
