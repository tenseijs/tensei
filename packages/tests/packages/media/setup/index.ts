import Fs from 'fs'
import Path from 'path'
import { media } from '@tensei/media'
import { graphql } from '@tensei/graphql'
import { PluginContract, resource, hasMany, text, plugin } from '@tensei/core'

import { setup as baseSetup } from '../../../helpers'

export * from '../../../helpers'

export const meetingResource = () =>
    resource('Meeting').fields([
        text('Name').nullable(),
        hasMany('File', 'screenshots'),
        hasMany('File', 'archives')
    ])

export const gistResource = () =>
    resource('Gist').fields([
        text('Title').nullable(),
        hasMany('File', 'attachments')
    ])

export const setup = (maxFileSize = 10000000) =>
    baseSetup(
        [
            plugin('Add meeting resource').register(({ extendResources }) => {
                extendResources([meetingResource(), gistResource()])
            }),
            media().maxFiles(4).maxFileSize(maxFileSize).plugin(),
            graphql().plugin()
        ],
        true
    )

export const getFileFixture = (file_name: string) =>
    Fs.createReadStream(Path.resolve(__dirname, 'fixtures', file_name))
