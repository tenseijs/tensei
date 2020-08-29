import { date } from '../../../fields/Date'
import { text } from '../../../fields/Text'
import { select } from '../../../fields/Select'
import { action } from '../../../actions/Action'
import { integer } from '../../../fields/Integer'
import { dateTime } from '../../../fields/DateTime'
import { textarea } from '../../../fields/Textarea'
import { belongsTo } from '../../../fields/BelongsTo'
import { resource } from '../../../resources/Resource'
import { belongsToMany } from '../../../fields/BelongsToMany'

export default resource('Administrator')
    .fields([
        text('Name').searchable().rules('required'),
        text('Email')
            .unique()
            .searchable()
            .notNullable()
            .rules('required|email'),
        text('Password')
            .hidden()
            .notNullable()
            .htmlAttributes({
                type: 'password',
            })
            .rules('required')
            .hidden()
            .onlyOnForms()
            .hideWhenUpdating(),
    ])
    .group('Users & Permissions')
