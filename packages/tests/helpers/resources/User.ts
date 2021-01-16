import { Cascade } from '@mikro-orm/core'
import { text, resource, hasMany } from '@tensei/common'

export default resource('User')
    .fields([
        text('Full name').searchable().rules('required'),
        text('Email')
            .unique()
            .searchable()
            .htmlAttributes({
                type: 'email'
            })
            .rules('required', 'max:84', 'email'),
        text('Password')
            .htmlAttributes({
                type: 'password'
            })
            .hideOnUpdate()
            .hideOnIndex()
            .hideOnDetail()
            .rules('required', 'min:8', 'max:24')
            .notNullable(),
        hasMany('Post').cascades([Cascade.MERGE])
    ])
    .displayField('Full name')
    .perPageOptions([2, 5, 10])
