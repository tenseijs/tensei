import { cms } from '@tensei/cms'
import { rest } from '@tensei/rest'
import { auth } from '@tensei/auth'
import { graphql } from '@tensei/graphql'
import { files, media } from '@tensei/media'

import {
  tensei,
  welcome,
  cors,
  resource,
  text,
  textarea,
  integer,
  slug,
  belongsTo,
  belongsToMany,
  hasMany,
  boolean
} from '@tensei/core'
import { seed } from './seed'

export default tensei()
  .resources([
    resource('Product')
      .fields([
        text('Name').rules('required'),
        slug('Slug')
          .creationRules('required', 'unique:slug')
          .unique()
          .from('Name'),
        textarea('Description').creationRules('required', 'max:255'),
        integer('Price').rules('required'),
        belongsToMany('Category'),
        belongsToMany('Product Option'),
        belongsToMany('Order Item'),
        belongsToMany('Collection'),
        belongsToMany('Review'),
        files('Image')
      ])
      .displayField('Name'),
    resource('Category')
      .fields([
        text('Name').notNullable().rules('required'),
        slug('Slug')
          .creationRules('required', 'unique:slug')
          .unique()
          .from('Name'),
        textarea('Description').nullable(),
        belongsToMany('Product')
      ])
      .displayField('Name'),
    resource('Collection')
      .fields([
        text('Name').notNullable().rules('required'),
        slug('Slug')
          .creationRules('required', 'unique:slug')
          .unique()
          .from('Name'),
        textarea('Description').nullable(),
        belongsToMany('Product')
      ])
      .displayField('Name'),
    resource('Review').fields([
      text('Headline').rules('required'),
      belongsTo('Customer').nullable(),
      text('Name').nullable(),
      text('Email').nullable(),
      textarea('Content').rules('required'),
      integer('Rating').rules('required', 'min:0', 'max:5'),
      boolean('Approved').default(false).hideOnCreate().hideOnCreateApi(),
      belongsTo('Product')
    ]),
    resource('Order').fields([
      integer('Total').rules('required'),
      belongsTo('Customer'),
      text('Stripe Checkout ID'),
      belongsToMany('Product')
    ]),
    resource('Order Item').fields([
      integer('Quantity').min(0).rules('min:0', 'required'),
      integer('Total').rules('required', 'min:0'),
      belongsTo('Order').rules('required'),
      belongsTo('Product').rules('required')
    ]),
    resource('Option').fields([
      text('Name').rules('Required'),
      slug('Short name')
        .creationRules('required', 'unique:slug')
        .unique()
        .from('Name')
    ]),
    resource('Option Value').fields([
      text('Name').rules('Required'),
      slug('Short name')
        .creationRules('required', 'unique:slug')
        .unique()
        .from('Name'),
      belongsToMany('Option')
    ]),
    resource('Product Option').fields([
      belongsToMany('Option'),
      belongsToMany('Option Value'),
      belongsToMany('Product'),
      files('Image')
    ])
  ])
  .plugins([
    welcome(),
    cms().plugin(),
    media().plugin(),
    auth()
      .user('Customer')
      .configureTokens({
        accessTokenExpiresIn: 60 * 60 * 60 * 60 * 60
      })
      .verifyEmails()
      .plugin(),
    rest().plugin(),
    graphql().plugin(),
    cors()
  ])
  .db({
    type: 'sqlite',
    dbName: 'db.sqlite'
  })
  .boot(async ({ repositories }) => {
    await seed(repositories)
    console.log('App running on http://localhost:8810')
  })
  .start()
  .catch(console.error)
