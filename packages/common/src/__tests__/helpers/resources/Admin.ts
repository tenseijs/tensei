import { text } from '../../../fields/Text'
import { resource } from '../../../resources/Resource'

export default resource('Administrator')
    .fields([
        text('Name').searchable().rules('required'),
        text('Email')
            .unique()
            .searchable()
            .notNullable()
            .rules('required', 'email'),
        text('Password')
            .hidden()
            .notNullable()
            .htmlAttributes({
                type: 'password',
            })
            .rules('required')
            .hidden()
            .onlyOnForms()
            .hideOnUpdate(),
    ])
    .group('Users & Permissions')
