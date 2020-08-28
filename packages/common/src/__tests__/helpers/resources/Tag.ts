import { text } from '../../../fields/Text'
import { textarea } from '../../../fields/Textarea'
import { resource } from '../../../resources/Resource'
import { belongsToMany } from '../../../fields/BelongsToMany'

export default resource('Tag')
    .fields([
        text('Name').rules('required').searchable(),
        textarea('Description'),
        belongsToMany('Post'),
    ])
    .displayField('name')
