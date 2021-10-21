import Path from 'path'
import { cms } from '@tensei/cms'
import { rest } from '@tensei/rest'
import { markdown } from '@tensei/mde'
import { graphql } from '@tensei/graphql'
import { auth, permission, role } from '@tensei/auth'

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
  boolean,
  select
} from '@tensei/core'

export default tensei()
  .resources([
    resource('Post')
      .fields([
        text('Title').rules('required'),
        slug('Slug')
          .creationRules('required', 'unique:slug')
          .unique()
          .from('Title'),
        markdown('Description').creationRules('required', 'max:255'),
        textarea('Content').nullable().rules('required'),
        dateTime('Published At').creationRules('required'),
        belongsTo('Category').alwaysLoad(),
        array('Procedure')
          .of('decimal')
          .rules('min:3', 'max:10')
          .creationRules('required', 'max:24'),
        array('Prices')
          .nullable()
          .of('string')
          .rules('max:10', 'min:2')
          .creationRules('required', 'max:500')
      ])
      .icon('library')
      .displayField('Title'),
    resource('Category')
      .fields([
        text('Name').notNullable().rules('required'),
        textarea('Description'),
        belongsTo('User').nullable(),
        select('Specificity').options(['None', 'Some', 'All']),
        hasMany('Post')
      ])
      .displayField('Name')
  ])
  .plugins([
    welcome(),
    cms().plugin(),
    auth()
      .teams()
      .configureTokens({
        accessTokenExpiresIn: 60 * 60 * 60 * 60 * 60
      })
      .roles([
        role('Chief Marketer').permissions([
          permission('Create Pages'),
          permission('Delete Pages'),
          permission('Update Pages'),
          permission('Link Menu To Pages')
        ]),
        role('Teacher').permissions([permission('Authorize Comments')])
      ])
      .teamPermissions([permission('Create Article')])
      .verifyEmails()
      .setup(({ user }) => {
        user.fields([
          hasMany('Category'),
          boolean('Accepted Terms And Conditions')
            .rules('required')
            .default(false)
        ])
      })
      .plugin(),
    rest().plugin(),
    graphql().plugin(),
    cors()
  ])
  .db({
    type: 'sqlite',
    dbName: 'db.sqlite'
  })
  .boot(() => {
    console.log('App running on http://localhost:8810')
  })
  .start()
  .catch(console.error)
