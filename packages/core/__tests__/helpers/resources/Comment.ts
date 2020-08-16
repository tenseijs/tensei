import { text, belongsTo, resource, textarea } from '@flamingo/common'

export default resource('Comment').fields([
    text('Title').rules('required').searchable(),
    textarea('Body').rules('required'),
    belongsTo('Post'),
])
