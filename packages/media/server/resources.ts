import {
  text,
  json,
  integer,
  hasMany,
  resource,
  belongsTo,
  bigInteger
} from '@tensei/common'
import { Cascade } from '@mikro-orm/core'
import { MediaLibraryPluginConfig } from './types'

export const mediaResource = (config: MediaLibraryPluginConfig) =>
  resource('File')
    .fields([
      bigInteger('Size')
        .description('The file size in Kb')
        .rules('required', 'number')
        .searchable(),
      integer('Width').nullable(),
      integer('Height').nullable(),
      text('Name').nullable().searchable(),
      text('Url').searchable(),
      text('Extension')
        .description('The file extension, for example psd, pdf, png')
        .searchable(),
      text('Mime Type').nullable().searchable(),
      text('Hash').searchable(),
      text('Hash Prefix').searchable().nullable(),
      text('Path').nullable().searchable(),
      text('Alt Text').nullable().searchable(),
      text('Disk').nullable(),
      json('Disk Meta').nullable(),
      hasMany('File', 'transformations').alwaysLoad().cascades([Cascade.ALL]),
      belongsTo('File').nullable()
    ])
    .hideFromNavigation()
    .hideOnCreateApi()
    .hideOnUpdateApi()
    .displayField('Name')
    .afterDelete((event, ctx) => {
      ctx.storage.disk(event.entity.disk).destroy(event.entity as any)

      event.entity.toJSON().transformations.forEach((file: any) => {
        ctx.storage.disk(event.entity.disk).destroy(file)
      })
    })
    .noPermissions()
    .perPageOptions([10, 20, 30, 50, 100])
