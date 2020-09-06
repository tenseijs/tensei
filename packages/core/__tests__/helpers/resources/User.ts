import { text, resource, hasMany } from '@tensei/common'

export default resource('User')
    .fields([
        text('Full name').searchable().rules('required'),
        text('Email')
            .unique()
            .searchable()
            .htmlAttributes({
                type: 'email',
            })
            .rules('required', 'max:84', 'email'),
        text('Password')
            .htmlAttributes({
                type: 'password',
            })
            .hideWhenUpdating()
            .hideFromIndex()
            .hideFromDetail()
            .rules('required', 'min:8', 'max:24')
            .notNullable(),
        hasMany('Post'),
    ])
    .displayField('full_name')
    .perPageOptions([2, 5, 10])
