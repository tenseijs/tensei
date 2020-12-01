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
        hasMany('File', 'screenshots').foreignKey('entity_id')
    ])

export const setup = (plugins: PluginContract[] = [], reset = true) =>
    baseSetup(
        [
            ...plugins,
            media().plugin(),
            plugin('Add meeting resource').register(({ extendResources }) => {
                extendResources([meetingResource()])
            }),
            graphql().plugin()
        ],
        reset
    )

export const getFileFixture = (file_name: string) =>
    Fs.createReadStream(Path.resolve(__dirname, 'fixtures', file_name))
