import Fs from 'fs'
import Path from 'path'
import { rest } from '@tensei/rest'
import { media } from '@tensei/media'
import { graphql } from '@tensei/graphql'
import { resource, hasMany, text, plugin, hasOne } from '@tensei/core'

import { setup as baseSetup } from '../../../helpers'

export * from '../../../helpers'

export const meetingResource = () =>
  resource('Meeting').fields([
    text('Name').nullable(),
    hasMany('File', 'screenshots'),
    hasMany('File', 'archives'),
    hasOne('File', 'banner').nullable()
  ])

export const editorResource = () =>
  resource('Editor').fields([
    text('Name').nullable(),
    hasOne('File', 'avatar').nullable()
  ])

export const gistResource = () =>
  resource('Gist').fields([
    text('Title').nullable(),
    hasMany('File', 'attachments')
  ])

export const setup = (maxFileSize = 10000000, maxFiles = 4) =>
  baseSetup(
    [
      plugin('Add meeting resource').register(({ extendResources }) => {
        extendResources([meetingResource(), gistResource(), editorResource()])
      }),
      media().graphql().maxFiles(maxFiles).maxFileSize(maxFileSize).plugin(),
      graphql().plugin(),
      rest().plugin()
    ],
    true
  )

export const getFileFixture = (file_name: string) =>
  Fs.createReadStream(Path.resolve(__dirname, 'fixtures', file_name))
