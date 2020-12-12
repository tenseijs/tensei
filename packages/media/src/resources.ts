import {
    text,
    json,
    integer,
    hasMany,
    resource,
    belongsTo,
    bigInteger
} from '@tensei/common'

export const mediaResource = () =>
    resource('File')
        .fields([
            bigInteger('Size')
                .description('The file size in Kb')
                .rules('required', 'number')
                .searchable(),
            integer('Width').nullable(),
            integer('Height').nullable(),
            text('Original Filename').nullable().searchable(),
            text('Extension')
                .description('The file extension, for example psd, pdf, png')
                .searchable(),
            text('Mime Type').nullable().searchable(),
            text('Hash').searchable(),
            text('Path').nullable().searchable(),
            text('Alt Text').nullable(),
            text('Disk').nullable(),
            json('Disk Meta').nullable(),
            hasMany('File', 'transformations'),
            belongsTo('File').nullable()
        ])
        .hideFromNavigation()
        .hideOnInsertApi()
        .hideOnUpdateApi()
