import { cms } from '@tensei/cms'
import { rest } from '@tensei/rest'
import { graphql } from '@tensei/graphql'
import { mde, markdown } from '@tensei/mde'
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
  route
} from '@tensei/core'

export default tensei()
  .root(__dirname)
  .resources([
    resource('Post')
      .canInsert(({ authUser }) => false)
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
        hasMany('Post')
      ])
      .displayField('Name')
  ])
  .plugins([
    welcome(),
    cms().plugin(),
    auth()
      .teams()
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
      .configureTokens({
        accessTokenExpiresIn: 60,
        refreshTokenExpiresIn: 240
      })
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
    cors(),
    mde().plugin()
  ])
  .db({
    type: 'sqlite',
    dbName: 'db.sqlite'
  })
  .start()
  .catch(console.error)
