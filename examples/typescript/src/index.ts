import { cms } from '@tensei/cms'
import { auth } from '@tensei/auth'
import { rest } from '@tensei/rest'
import { graphql } from '@tensei/graphql'
import { mde, markdown } from '@tensei/mde'

import {     
    tensei,
    welcome,
    cors,
    resource,
    text,
    textarea,
    dateTime,
    slug,
    array,
    hasMany,
    belongsTo,
    boolean
} from '@tensei/core'

tensei()
    .root(__dirname)
    .resources([
        resource('Post')
            .fields([
                text('Title').rules('required'),
                slug('Slug').creationRules('required', 'unique:slug').unique().from('Title'),
                markdown('Description').creationRules('required', 'max:255'),
                textarea('Content').nullable().rules('required'),
                dateTime('Published At').creationRules('required'),
                belongsTo('Category').alwaysLoad(),
                array('Procedure')
                    .of('string')
                    .rules('min:3', 'max:10')
                    .creationRules('required'),
                array('Prices')
                    .nullable()
                    .of('decimal')
                    .rules('max:10', 'min:2')
                    .creationRules('required')
            ])
            .icon('library')
            .displayField('Title'),
        resource('Category')
            .fields([
                text('Name').notNullable().rules('required'),
                textarea('Description'),
                belongsTo('User').nullable(),
                hasMany('Post')
            ])
            .displayField('Name')
    ])
    .plugins([
        welcome(),
        cms().plugin(),
        auth()
            .verifyEmails()
            .configureTokens({
                accessTokenExpiresIn: 60,
                refreshTokenExpiresIn: 240
            })
            .setup(({ user }) => {
                user.fields([
                    hasMany('Category'),
                    boolean('Accepted Terms And Conditions').rules('required').default(false)
                ])
            })
        .plugin(),
        rest().plugin(),
        graphql().plugin(),
        cors(),
        mde().plugin()
    ])
    .db({
        type: 'sqlite',
        dbName: 'db.sqlite'
    })
    .start()
    .catch(console.error)
